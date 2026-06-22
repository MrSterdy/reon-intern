import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import {
    validateAmoOauthInstallQuery,
    validateAmoOauthUninstallQuery,
} from './amo-oauth-query.validator';

@Injectable()
export class AmoOauthService {
    public constructor(private readonly accountService: AccountService) {}

    public async handleInstall(query: Record<string, unknown>): Promise<void> {
        const command = validateAmoOauthInstallQuery(query);

        await this.accountService.handleInstall(command);
    }

    public async handleUninstall(
        query: Record<string, unknown>,
    ): Promise<void> {
        const command = validateAmoOauthUninstallQuery(query);

        await this.accountService.handleUninstall(command);
    }
}
