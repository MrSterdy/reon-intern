import { type Env } from '../shared/enums/env.enum';

export type ValidatedConfig = {
    [Env.AppPort]: number;
    [Env.NodeEnv]: string;
    [Env.PostgresHost]: string;
    [Env.PostgresPort]: number;
    [Env.PostgresUsername]: string;
    [Env.PostgresPassword]: string;
    [Env.PostgresDatabase]: string;
    [Env.EncryptionKey]: string;
    [Env.AmoClientId]: string;
    [Env.AmoClientSecret]: string;
    [Env.AmoRedirectUri]: string;
    [Env.AmoIntegrationBaseUrl]: string;
    [Env.AmoUninstallWebhookUrl]: string;
    [Env.AmoWebhookContactCreatedUrl]: string;
    [Env.AmoWebhookContactUpdatedUrl]: string;
    [Env.AmoWebhookLeadCreatedUrl]: string;
    [Env.AmoWebhookLeadUpdatedUrl]: string;
    [Env.AmoErrorTaskTypeId]: number;
    [Env.AmoCheckTaskTypeId]: number;
};
