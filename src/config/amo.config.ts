import { registerAs } from '@nestjs/config';
import { Env } from '../shared/enums/env.enum';

export const amoConfig = registerAs('amo', () => ({
    clientId: process.env[Env.AmoClientId],
    clientSecret: process.env[Env.AmoClientSecret],
    redirectUri: process.env[Env.AmoRedirectUri],
    integrationBaseUrl: process.env[Env.AmoIntegrationBaseUrl],
    uninstallWebhookUrl: process.env[Env.AmoUninstallWebhookUrl],
    webhooks: {
        contactCreatedUrl: process.env[Env.AmoWebhookContactCreatedUrl],
        contactUpdatedUrl: process.env[Env.AmoWebhookContactUpdatedUrl],
        leadCreatedUrl: process.env[Env.AmoWebhookLeadCreatedUrl],
        leadUpdatedUrl: process.env[Env.AmoWebhookLeadUpdatedUrl],
    },
}));
