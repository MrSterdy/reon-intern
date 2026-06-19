import { AmoWebhookEvent } from '../api/amo-api/amo-api.types';

export type WebhookConfigKey =
    | 'amo.webhooks.contactCreatedUrl'
    | 'amo.webhooks.contactUpdatedUrl'
    | 'amo.webhooks.leadCreatedUrl'
    | 'amo.webhooks.leadUpdatedUrl';

export type RequiredWebhookSubscription = {
    configKey: WebhookConfigKey;
    event: AmoWebhookEvent;
};
