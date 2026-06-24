import { Injectable, Logger } from '@nestjs/common';
import { ContactService } from './contact.service';
import { validateContactWebhookBody } from './contact-webhook.validator';
import { ContactWebhookAction, ContactWebhookEntry } from './contact.types';
import { AccountService } from '../account/account.service';

@Injectable()
export class ContactWebhookService {
    private readonly logger = new Logger(ContactWebhookService.name);

    public constructor(
        private readonly contactService: ContactService,
        private readonly accountService: AccountService,
    ) {}

    public async handleWebhook(
        body: Record<string, unknown>,
        action: ContactWebhookAction,
    ): Promise<void> {
        const entries = validateContactWebhookBody(body, action);

        for (const entry of entries) {
            try {
                await this.processWebhookEntry(entry);
            } catch (error) {
                this.logger.error(
                    `Failed to process amoCRM contact ${entry.contactId} for account ${entry.accountId}`,
                    error instanceof Error ? error.stack : undefined,
                );
            }
        }
    }

    private async processWebhookEntry(
        entry: ContactWebhookEntry,
    ): Promise<void> {
        const account = await this.accountService.findInstalledByAccountId(
            entry.accountId,
        );

        if (account === null || account.accessToken === null) {
            return;
        }

        await this.contactService.ensureAgeForContact(account, entry.contactId);
    }
}
