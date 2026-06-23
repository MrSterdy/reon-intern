import { BadGatewayException, Logger } from '@nestjs/common';
import { validateJoiSchema } from '../../../shared/helpers/joi.helpers';
import {
    amoAccountResponseSchema,
    amoContactResponseSchema,
    amoCustomFieldListResponseSchema,
    amoLeadResponseSchema,
    amoTaskListResponseSchema,
    amoTaskResponseSchema,
    amoTokenResponseSchema,
    amoWebhookResponseSchema,
} from './amo-api.schemas';
import {
    AmoAccountResponse,
    AmoApiResponseValidator,
    AmoResponseValidatorConfig,
    AmoWebhookResponse,
} from './amo-api.types';
import {
    mapAmoContactResponse,
    mapAmoCustomFieldListResponse,
    mapAmoLeadResponse,
    mapAmoTaskListResponse,
    mapAmoTaskResponse,
    mapAmoTokenResponse,
} from './amo-api.mappers';

const logger = new Logger('AmoApiValidator');

function createAmoResponseValidator<TResponse, TRawResponse = TResponse>({
    schema,
    map,
}: AmoResponseValidatorConfig<
    TRawResponse,
    TResponse
>): AmoApiResponseValidator<TResponse> {
    return (body: unknown, invalidResponseMessage: string): TResponse => {
        try {
            const validatedBody = validateJoiSchema(schema, body, {
                abortEarly: false,
                convert: false,
            });

            return map
                ? map(validatedBody)
                : (validatedBody as unknown as TResponse);
        } catch (error: unknown) {
            logger.error(
                invalidResponseMessage,
                error instanceof Error ? error.stack : undefined,
            );

            throw new BadGatewayException(invalidResponseMessage);
        }
    };
}

export const validateAmoTokenResponse = createAmoResponseValidator({
    schema: amoTokenResponseSchema,
    map: mapAmoTokenResponse,
});

export const validateAmoAccountResponse =
    createAmoResponseValidator<AmoAccountResponse>({
        schema: amoAccountResponseSchema,
    });

export const validateAmoCustomFieldListResponse = createAmoResponseValidator({
    schema: amoCustomFieldListResponseSchema,
    map: mapAmoCustomFieldListResponse,
});

export const validateAmoWebhookResponse =
    createAmoResponseValidator<AmoWebhookResponse>({
        schema: amoWebhookResponseSchema,
    });

export const validateAmoContactResponse = createAmoResponseValidator({
    schema: amoContactResponseSchema,
    map: mapAmoContactResponse,
});

export const validateAmoLeadResponse = createAmoResponseValidator({
    schema: amoLeadResponseSchema,
    map: mapAmoLeadResponse,
});

export const validateAmoTaskListResponse = createAmoResponseValidator({
    schema: amoTaskListResponseSchema,
    map: mapAmoTaskListResponse,
});

export const validateAmoTaskResponse = createAmoResponseValidator({
    schema: amoTaskResponseSchema,
    map: mapAmoTaskResponse,
});
