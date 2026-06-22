import { Env } from '../../shared/enums/env.enum';
import { RequiredWebhookSubscription } from './webhook.types';

export const REQUIRED_WEBHOOK_SUBSCRIPTIONS: RequiredWebhookSubscription[] = [
    {
        configKey: Env.AmoWebhookContactCreatedUrl,
        event: 'add_contact',
    },
    {
        configKey: Env.AmoWebhookContactUpdatedUrl,
        event: 'update_contact',
    },
    {
        configKey: Env.AmoWebhookLeadCreatedUrl,
        event: 'add_lead',
    },
    {
        configKey: Env.AmoWebhookLeadUpdatedUrl,
        event: 'update_lead',
    },
];
