import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import type { ContactWebhookBody, ContactWebhookResult } from './contact.types';

@Controller('amo/webhooks/contacts')
export class ContactWebhookController {
    public constructor(private readonly contactService: ContactService) {}

    @Post('created')
    @HttpCode(200)
    public async created(
        @Body() body: ContactWebhookBody,
    ): Promise<ContactWebhookResult> {
        await this.contactService.handleWebhook(body, 'add');

        return { status: 'accepted' };
    }

    @Post('updated')
    @HttpCode(200)
    public async updated(
        @Body() body: ContactWebhookBody,
    ): Promise<ContactWebhookResult> {
        await this.contactService.handleWebhook(body, 'update');

        return { status: 'accepted' };
    }
}
