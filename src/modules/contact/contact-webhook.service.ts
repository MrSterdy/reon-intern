import { Injectable } from '@nestjs/common';
import { ContactService } from './contact.service';
import { validateContactWebhookBody } from './contact-webhook.validator';
import { ContactWebhookAction } from './contact.types';

@Injectable()
export class ContactWebhookService {
    public constructor(private readonly contactService: ContactService) {}

    public async handleWebhook(
        body: Record<string, unknown>,
        action: ContactWebhookAction,
    ): Promise<void> {
        const entries = validateContactWebhookBody(body, action);

        await this.contactService.handleWebhook(entries);
    }
}
