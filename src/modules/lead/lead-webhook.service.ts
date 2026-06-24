import { Injectable } from '@nestjs/common';
import { LeadService } from './lead.service';
import { validateLeadWebhookBody } from './lead-webhook.validator';
import { LeadWebhookAction } from './lead.types';

@Injectable()
export class LeadWebhookService {
    public constructor(private readonly leadService: LeadService) {}

    public async handleWebhook(
        body: Record<string, unknown>,
        action: LeadWebhookAction,
    ): Promise<void> {
        const entries = validateLeadWebhookBody(body, action);

        await this.leadService.handleWebhook(entries);
    }
}
