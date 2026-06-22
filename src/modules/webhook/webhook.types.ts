import { AmoWebhookEvent } from '../api/amo-api/amo-api.types';
import { Env } from '../../shared/enums/env.enum';

export type WebhookConfigKey =
    | Env.AmoWebhookContactCreatedUrl
    | Env.AmoWebhookContactUpdatedUrl
    | Env.AmoWebhookLeadCreatedUrl
    | Env.AmoWebhookLeadUpdatedUrl;

export type RequiredWebhookSubscription = {
    configKey: WebhookConfigKey;
    event: AmoWebhookEvent;
};
