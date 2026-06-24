import { ENDPOINTS } from '../../shared/constants/endpoints';
import { RequiredWebhookSubscription } from './webhook.types';

export const REQUIRED_WEBHOOK_SUBSCRIPTIONS: RequiredWebhookSubscription[] = [
    {
        endpointSegments: [
            ENDPOINTS.amo.webhooks.contacts.base,
            ENDPOINTS.amo.webhooks.contacts.created,
        ],
        event: 'add_contact',
    },
    {
        endpointSegments: [
            ENDPOINTS.amo.webhooks.contacts.base,
            ENDPOINTS.amo.webhooks.contacts.updated,
        ],
        event: 'update_contact',
    },
    {
        endpointSegments: [
            ENDPOINTS.amo.webhooks.leads.base,
            ENDPOINTS.amo.webhooks.leads.created,
        ],
        event: 'add_lead',
    },
    {
        endpointSegments: [
            ENDPOINTS.amo.webhooks.leads.base,
            ENDPOINTS.amo.webhooks.leads.updated,
        ],
        event: 'update_lead',
    },
];
