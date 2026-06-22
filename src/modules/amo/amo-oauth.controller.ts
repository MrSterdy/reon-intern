import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { AmoOauthInstallQueryDto } from '../account/dto/amo-oauth-install-query.dto';
import { AmoOauthUninstallQueryDto } from '../account/dto/amo-oauth-uninstall-query.dto';
import { AmoOauthResult } from './amo.types';
import { ENDPOINTS } from '../../shared/constants/endpoints';

@Controller(ENDPOINTS.amo.oauth.base)
export class AmoOauthController {
    public constructor(private readonly accountService: AccountService) {}

    @Get(ENDPOINTS.amo.oauth.install)
    public async install(
        @Query() query: AmoOauthInstallQueryDto,
    ): Promise<AmoOauthResult> {
        await this.accountService.handleInstall(query);

        return { status: 'installed' };
    }

    @Get(ENDPOINTS.amo.oauth.uninstall)
    @HttpCode(200)
    public async uninstall(
        @Query() query: AmoOauthUninstallQueryDto,
    ): Promise<AmoOauthResult> {
        await this.accountService.handleUninstall(query);

        return { status: 'uninstalled' };
    }
}
