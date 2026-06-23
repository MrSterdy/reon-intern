import { BadGatewayException, Logger } from '@nestjs/common';
import * as Joi from 'joi';
import { validateJoiSchema } from '../../../shared/helpers/joi.helpers';

const logger = new Logger('AmoApiValidator');

export function validateAmoApiResponse<TResponse>(
    schema: Joi.ObjectSchema<TResponse>,
    body: unknown,
    invalidResponseMessage: string,
    invalidResponseDetails: string,
): TResponse {
    try {
        return validateJoiSchema(schema, body, {
            abortEarly: false,
            convert: false,
        });
    } catch (error: unknown) {
        logger.error(
            invalidResponseMessage,
            error instanceof Error ? error.stack : undefined,
        );

        throw new BadGatewayException(invalidResponseDetails);
    }
}
