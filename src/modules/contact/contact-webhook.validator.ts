import * as Joi from 'joi';
import { validateJoiSchema } from '../../shared/helpers/joi.helpers';
import {
    AmoContactWebhookBody,
    ContactWebhookAction,
    ContactWebhookEntry,
} from './contact.types';
import { contactWebhookEntryMapSchema } from './contact-webhook.schemas';

export function validateContactWebhookBody(
    body: Record<string, unknown>,
    action: ContactWebhookAction,
): ContactWebhookEntry[] {
    let validatedBody: AmoContactWebhookBody | null = null;

    try {
        const schema = Joi.object<AmoContactWebhookBody>({
            contacts: Joi.object({
                [action]: contactWebhookEntryMapSchema,
            })
                .required()
                .unknown(true),
        }).unknown(true);

        validatedBody = validateJoiSchema(schema, body, {
            abortEarly: false,
            convert: false,
        });
    } catch {
        // TODO: log
    }

    if (validatedBody === null) {
        return [];
    }

    return Object.values(validatedBody.contacts[action]).map(
        (entry): ContactWebhookEntry => ({
            contactId: String(entry.id),
            accountId: String(entry.account_id),
        }),
    );
}
