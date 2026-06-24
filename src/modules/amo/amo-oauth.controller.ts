import { Controller, Get, HttpCode, Query } from '@nestjs/common';
import { AmoOauthResult } from './amo.types';
import { ENDPOINTS } from '../../shared/constants/endpoints';
import { AmoOauthService } from './amo-oauth.service';

@Controller(ENDPOINTS.amo.oauth.base)
export class AmoOauthController {
    public constructor(private readonly amoOauthService: AmoOauthService) {}

    @Get(ENDPOINTS.amo.oauth.install)
    public async install(
        @Query() query: Record<string, unknown>,
    ): Promise<AmoOauthResult> {
        await this.amoOauthService.handleInstall(query);

        return { status: 'installed' };
    }

    @Get(ENDPOINTS.amo.oauth.uninstall)
    @HttpCode(200)
    public async uninstall(
        @Query() query: Record<string, unknown>,
    ): Promise<AmoOauthResult> {
        await this.amoOauthService.handleUninstall(query);

        return { status: 'uninstalled' };
    }
}
