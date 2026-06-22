import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { CustomFieldService } from '../custom-field/custom-field.service';
import { WebhookService } from '../webhook/webhook.service';
import { Env } from '../../shared/enums/env.enum';
import { AccountEntity } from './account.entity';
import { AccountRepository } from './account.repository';
import { ACCOUNT_TOKEN_REFRESH_BATCH_SIZE } from './account.consts';
import {
    AmoOauthInstallCommand,
    AmoOauthUninstallCommand,
} from './account.types';
import { createHmac, timingSafeEqual } from 'node:crypto';

@Injectable()
export class AccountService {
    private readonly logger = new Logger(AccountService.name);

    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly amoApiService: AmoApiService,
        private readonly customFieldService: CustomFieldService,
        private readonly webhookService: WebhookService,
        private readonly configService: ConfigService,
    ) {}

    public async handleInstall(
        command: AmoOauthInstallCommand,
    ): Promise<AccountEntity> {
        const tokenResponse =
            await this.amoApiService.exchangeAuthorizationCode(
                command.referer,
                command.code,
                command.redirectUri,
            );
        const amoAccount = await this.amoApiService.getAccount(
            command.referer,
            tokenResponse.accessToken,
        );

        const account = await this.accountRepository.saveInstalledAccount({
            accountId: String(amoAccount.id),
            subdomain: amoAccount.subdomain,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
        });

        await Promise.all([
            this.customFieldService.syncForAccount(account),
            this.webhookService.syncForAccount(account),
        ]);

        return account;
    }

    public async findInstalledByAccountId(
        accountId: string,
    ): Promise<AccountEntity | null> {
        return await this.accountRepository.findInstalledByAccountId(accountId);
    }

    public async handleUninstall(
        command: AmoOauthUninstallCommand,
    ): Promise<void> {
        this.assertValidUninstallSignature(command);

        await this.accountRepository.markUninstalled(command.accountId);
    }

    public async refreshInstalledAccountTokens(): Promise<void> {
        const accounts =
            await this.accountRepository.findInstalledAccountsWithTokens();

        for (
            let index = 0;
            index < accounts.length;
            index += ACCOUNT_TOKEN_REFRESH_BATCH_SIZE
        ) {
            const batch = accounts.slice(
                index,
                index + ACCOUNT_TOKEN_REFRESH_BATCH_SIZE,
            );

            await Promise.all(
                batch.map((account) =>
                    this.refreshInstalledAccountToken(account),
                ),
            );
        }
    }

    private async refreshInstalledAccountToken(
        account: AccountEntity,
    ): Promise<void> {
        try {
            const tokenResponse = await this.amoApiService.refreshAccessToken(
                account.subdomain,
                account.refreshToken!,
            );

            await this.accountRepository.updateTokens({
                accountId: account.accountId,
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
            });
        } catch (error) {
            this.logger.error(
                `Failed to refresh tokens for amoCRM account ${account.accountId}`,
                error instanceof Error ? error.stack : undefined,
            );
        }
    }

    private assertValidUninstallSignature(
        query: AmoOauthUninstallCommand,
    ): void {
        const clientId = this.configService.getOrThrow<string>(Env.AmoClientId);
        const clientSecret = this.configService.getOrThrow<string>(
            Env.AmoClientSecret,
        );

        if (query.clientUuid !== clientId) {
            throw new UnauthorizedException('Invalid amoCRM hook client');
        }

        const expectedSignature = createHmac('sha256', clientSecret)
            .update(`${clientId}|${query.accountId}`)
            .digest('hex');

        const expectedBuffer = Buffer.from(expectedSignature);
        const receivedBuffer = Buffer.from(query.signature);

        const isEqualSignature =
            expectedBuffer.length === receivedBuffer.length &&
            timingSafeEqual(expectedBuffer, receivedBuffer);

        if (isEqualSignature) {
            throw new UnauthorizedException('Invalid amoCRM hook signature');
        }
    }
}
