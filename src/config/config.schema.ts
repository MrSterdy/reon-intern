import * as Joi from 'joi';
import { Env } from '../shared/enums/env.enum';

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
};

export type ValidatedDatabaseConfig = Pick<
    ValidatedConfig,
    | Env.PostgresHost
    | Env.PostgresPort
    | Env.PostgresUsername
    | Env.PostgresPassword
    | Env.PostgresDatabase
>;

const databaseConfigurationSchema = {
    [Env.PostgresHost]: Joi.string().required(),
    [Env.PostgresPort]: Joi.number().port().required(),
    [Env.PostgresUsername]: Joi.string().required(),
    [Env.PostgresPassword]: Joi.string().required(),
    [Env.PostgresDatabase]: Joi.string().required(),
};

export const configurationValidationSchema = Joi.object<ValidatedConfig>({
    [Env.AppPort]: Joi.number().port().default(3000),
    [Env.NodeEnv]: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    ...databaseConfigurationSchema,
    [Env.EncryptionKey]: Joi.string().min(32).required(),
    [Env.AmoClientId]: Joi.string().required(),
    [Env.AmoClientSecret]: Joi.string().required(),
    [Env.AmoRedirectUri]: Joi.string().uri().required(),
    [Env.AmoIntegrationBaseUrl]: Joi.string().uri().required(),
    [Env.AmoUninstallWebhookUrl]: Joi.string().uri().required(),
});

export const databaseConfigurationValidationSchema =
    Joi.object<ValidatedDatabaseConfig>(databaseConfigurationSchema);

function validateSchema<TConfig>(
    schema: Joi.ObjectSchema<TConfig>,
    config: Record<string, unknown>,
): TConfig {
    const validationResult: Joi.ValidationResult<TConfig> = schema.validate(
        config,
        {
            abortEarly: true,
            allowUnknown: true,
        },
    );

    if (validationResult.error) {
        throw new Error(
            `Config validation error: ${validationResult.error.message}`,
        );
    }

    return validationResult.value;
}

export function validateDatabaseConfig(
    config: Record<string, unknown>,
): ValidatedDatabaseConfig {
    return validateSchema(databaseConfigurationValidationSchema, config);
}
