import { AmoWebhookEvent } from '../api/amo-api/amo-api.types';

export type RequiredWebhookSubscription = {
    endpointSegments: string[];
    event: AmoWebhookEvent;
};
