import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LeadWebhookService } from './lead-webhook.service';
import type { LeadWebhookResult } from './lead.types';
import { ENDPOINTS } from '../../shared/constants/endpoints';

@Controller(ENDPOINTS.amo.webhooks.leads.base)
export class LeadWebhookController {
    public constructor(
        private readonly leadWebhookService: LeadWebhookService,
    ) {}

    @Post(ENDPOINTS.amo.webhooks.leads.created)
    @HttpCode(200)
    public async created(
        @Body() body: Record<string, unknown>,
    ): Promise<LeadWebhookResult> {
        await this.leadWebhookService.handleWebhook(body, 'add');

        return { status: 'accepted' };
    }

    @Post(ENDPOINTS.amo.webhooks.leads.updated)
    @HttpCode(200)
    public async updated(
        @Body() body: Record<string, unknown>,
    ): Promise<LeadWebhookResult> {
        await this.leadWebhookService.handleWebhook(body, 'update');

        return { status: 'accepted' };
    }
}
