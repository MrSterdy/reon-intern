import * as Joi from 'joi';

export function validateJoiSchema<TValue>(
    schema: Joi.ObjectSchema<TValue>,
    value: unknown,
    options?: Joi.ValidationOptions,
): TValue {
    const validationResult = schema.validate(value, options);

    if (validationResult.error) {
        throw validationResult.error;
    }

    return validationResult.value;
}
