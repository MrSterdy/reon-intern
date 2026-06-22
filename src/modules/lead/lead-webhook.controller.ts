import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LeadService } from './lead.service';
import type { LeadWebhookBody, LeadWebhookResult } from './lead.types';

@Controller('amo/webhooks/leads')
export class LeadWebhookController {
    public constructor(private readonly leadService: LeadService) {}

    @Post('created')
    @HttpCode(200)
    public async created(
        @Body() body: LeadWebhookBody,
    ): Promise<LeadWebhookResult> {
        await this.leadService.handleWebhook(body, 'add');

        return { status: 'accepted' };
    }

    @Post('updated')
    @HttpCode(200)
    public async updated(
        @Body() body: LeadWebhookBody,
    ): Promise<LeadWebhookResult> {
        await this.leadService.handleWebhook(body, 'update');

        return { status: 'accepted' };
    }
}
