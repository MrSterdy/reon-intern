import { RequiredWebhookSubscription } from './webhook.types';

export const REQUIRED_WEBHOOK_SUBSCRIPTIONS: RequiredWebhookSubscription[] = [
    {
        configKey: 'amo.webhooks.contactCreatedUrl',
        event: 'add_contact',
    },
    {
        configKey: 'amo.webhooks.contactUpdatedUrl',
        event: 'update_contact',
    },
    {
        configKey: 'amo.webhooks.leadCreatedUrl',
        event: 'add_lead',
    },
    {
        configKey: 'amo.webhooks.leadUpdatedUrl',
        event: 'update_lead',
    },
];
