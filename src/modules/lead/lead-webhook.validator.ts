import { Logger } from '@nestjs/common';
import * as Joi from 'joi';
import { validateJoiSchema } from '../../shared/helpers/joi.helpers';
import {
    AmoLeadWebhookBody,
    LeadWebhookAction,
    LeadWebhookEntry,
} from './lead.types';
import { leadWebhookEntryMapSchema } from './lead-webhook.schemas';

const logger = new Logger('LeadWebhookValidator');

export function validateLeadWebhookBody(
    body: Record<string, unknown>,
    action: LeadWebhookAction,
): LeadWebhookEntry[] {
    let validatedBody: AmoLeadWebhookBody | null = null;

    try {
        const schema = Joi.object<AmoLeadWebhookBody>({
            leads: Joi.object({
                [action]: leadWebhookEntryMapSchema,
            })
                .required()
                .unknown(true),
        }).unknown(true);

        validatedBody = validateJoiSchema(schema, body, {
            abortEarly: false,
            convert: false,
        });
    } catch (error: unknown) {
        logger.error(
            'Invalid amoCRM lead webhook contract',
            error instanceof Error ? error.stack : undefined,
        );
    }

    if (validatedBody === null) {
        return [];
    }

    return Object.values(validatedBody.leads[action]).map(
        (entry): LeadWebhookEntry => ({
            leadId: String(entry.id),
            accountId: String(entry.account_id),
        }),
    );
}
