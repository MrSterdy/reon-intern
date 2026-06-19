import * as Joi from 'joi';
import { Env } from '../shared/enums/env.enum';

export interface ValidatedConfig {
  [Env.AppPort]: number;
  [Env.NodeEnv]: string;
  [Env.PostgresHost]: string;
  [Env.PostgresPort]: number;
  [Env.PostgresUsername]: string;
  [Env.PostgresPassword]: string;
  [Env.PostgresDatabase]: string;
}

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
});

export function validateConfig(
  config: Record<string, unknown>,
): ValidatedConfig {
  const validationResult: Joi.ValidationResult<ValidatedConfig> =
    configurationValidationSchema.validate(config, {
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
