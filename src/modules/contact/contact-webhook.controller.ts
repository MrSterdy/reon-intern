import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ContactWebhookService } from './contact-webhook.service';
import type { ContactWebhookResult } from './contact.types';
import { ENDPOINTS } from '../../shared/constants/endpoints';

@Controller(ENDPOINTS.amo.webhooks.contacts.base)
export class ContactWebhookController {
    public constructor(
        private readonly contactWebhookService: ContactWebhookService,
    ) {}

    @Post(ENDPOINTS.amo.webhooks.contacts.created)
    @HttpCode(200)
    public async created(
        @Body() body: Record<string, unknown>,
    ): Promise<ContactWebhookResult> {
        await this.contactWebhookService.handleWebhook(body, 'add');

        return { status: 'accepted' };
    }

    @Post(ENDPOINTS.amo.webhooks.contacts.updated)
    @HttpCode(200)
    public async updated(
        @Body() body: Record<string, unknown>,
    ): Promise<ContactWebhookResult> {
        await this.contactWebhookService.handleWebhook(body, 'update');

        return { status: 'accepted' };
    }
}
