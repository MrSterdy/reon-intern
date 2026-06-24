import * as Joi from 'joi';
import { AmoLeadWebhookEntry } from './lead.types';

const leadWebhookEntrySchema = Joi.object<AmoLeadWebhookEntry>({
    id: Joi.alternatives(Joi.string(), Joi.number()).required(),
    account_id: Joi.alternatives(Joi.string(), Joi.number()).required(),
    type: Joi.string().valid('lead').optional(),
}).unknown(true);

export const leadWebhookEntryMapSchema = Joi.object<
    Record<string, AmoLeadWebhookEntry>
>()
    .pattern(Joi.string(), leadWebhookEntrySchema)
    .required()
    .unknown(true);
