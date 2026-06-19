import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { isValidAmoUninstallHookSignature } from '../amo/helpers/amo-uninstall-hook-signature.helper';
import { AccountEntity } from './account.entity';
import { AccountRepository } from './account.repository';
import { AmoOauthInstallQueryDto } from './dto/amo-oauth-install-query.dto';
import { AmoOauthUninstallQueryDto } from './dto/amo-oauth-uninstall-query.dto';

@Injectable()
export class AccountService {
    public constructor(
        private readonly accountRepository: AccountRepository,
        private readonly amoApiService: AmoApiService,
        private readonly configService: ConfigService,
    ) {}

    public async handleInstall(
        query: AmoOauthInstallQueryDto,
    ): Promise<AccountEntity> {
        const tokenResponse =
            await this.amoApiService.exchangeAuthorizationCode(
                query.referer,
                query.code,
                query.redirectUri,
            );
        const amoAccount = await this.amoApiService.getAccount(
            query.referer,
            tokenResponse.accessToken,
        );

        return this.accountRepository.saveInstalledAccount({
            accountId: String(amoAccount.id),
            subdomain: amoAccount.subdomain,
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
        });
    }

    public async handleUninstall(
        query: AmoOauthUninstallQueryDto,
    ): Promise<void> {
        this.assertValidUninstallSignature(query);

        await this.accountRepository.markUninstalled(query.accountId);
    }

    private assertValidUninstallSignature(
        query: AmoOauthUninstallQueryDto,
    ): void {
        const clientId = this.configService.getOrThrow<string>('amo.clientId');
        const clientSecret =
            this.configService.getOrThrow<string>('amo.clientSecret');

        if (query.clientUuid !== clientId) {
            throw new UnauthorizedException('Invalid amoCRM hook client');
        }

        if (
            !isValidAmoUninstallHookSignature({
                accountId: query.accountId,
                clientId,
                clientSecret,
                signature: query.signature,
            })
        ) {
            throw new UnauthorizedException('Invalid amoCRM hook signature');
        }
    }
}
