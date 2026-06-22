import { AmoContactWebhookEntry } from './contact.types';
import * as Joi from 'joi';

const contactWebhookEntrySchema = Joi.object<AmoContactWebhookEntry>({
    id: Joi.alternatives(Joi.string(), Joi.number()).required(),
    account_id: Joi.alternatives(Joi.string(), Joi.number()).required(),
    type: Joi.string().valid('contact').required(),
}).unknown(true);

export const contactWebhookEntryMapSchema = Joi.object<
    Record<string, AmoContactWebhookEntry>
>()
    .pattern(Joi.string(), contactWebhookEntrySchema)
    .required()
    .unknown(true);
