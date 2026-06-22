import * as Joi from 'joi';
import { Env } from '../shared/enums/env.enum';
import { ValidatedConfig } from './config.types';

export const configurationValidationSchema = Joi.object<ValidatedConfig>({
    [Env.AppPort]: Joi.number().port().default(3000),
    [Env.NodeEnv]: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    [Env.PostgresHost]: Joi.string().required(),
    [Env.PostgresPort]: Joi.number().port().required(),
    [Env.PostgresUsername]: Joi.string().required(),
    [Env.PostgresPassword]: Joi.string().required(),
    [Env.PostgresDatabase]: Joi.string().required(),
    [Env.EncryptionKey]: Joi.string().min(32).required(),
    [Env.AmoClientId]: Joi.string().required(),
    [Env.AmoClientSecret]: Joi.string().required(),
    [Env.AmoIntegrationBaseUrl]: Joi.string().uri().required(),
    [Env.AmoErrorTaskTypeId]: Joi.number().integer().min(0).required(),
    [Env.AmoCheckTaskTypeId]: Joi.number().integer().min(0).required(),
});

export function validateSchema<TConfig>(
    schema: Joi.ObjectSchema<TConfig>,
    config: Record<string, unknown>,
): TConfig {
    const validationResult = schema.validate(config, {
        abortEarly: true,
        allowUnknown: true,
    });

    if (validationResult.error) {
        throw new Error(
            `Config validation error: ${validationResult.error.message}`,
        );
    }

    return validationResult.value;
}
