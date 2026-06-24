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
    [Env.AmoIntegrationBaseUrl]: string;
    [Env.AmoErrorTaskTypeId]: number;
    [Env.AmoCheckTaskTypeId]: number;
};
