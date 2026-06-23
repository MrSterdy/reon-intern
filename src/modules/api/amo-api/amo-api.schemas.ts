import * as Joi from 'joi';
import {
    AmoAccountResponse,
    AmoWebhookResponse,
    RawAmoContactResponse,
    RawAmoCustomFieldListResponse,
    RawAmoLeadResponse,
    RawAmoTaskListResponse,
    RawAmoTaskResponse,
    RawAmoTokenResponse,
} from './amo-api.types';

const amoIdSchema = Joi.alternatives(Joi.number(), Joi.string()).required();

const customFieldValueSchema = Joi.object({
    value: Joi.alternatives(Joi.number(), Joi.string(), null).optional(),
    enum_id: Joi.alternatives(Joi.number(), Joi.string()).optional(),
    enum: Joi.alternatives(Joi.number(), Joi.string()).optional(),
}).unknown(true);

const entityCustomFieldSchema = Joi.object({
    field_id: amoIdSchema,
    field_name: Joi.string().optional(),
    field_type: Joi.string().optional(),
    values: Joi.array().items(customFieldValueSchema).optional(),
}).unknown(true);

const customFieldSchema = Joi.object({
    id: amoIdSchema,
    name: Joi.string().required(),
    type: Joi.string().required(),
    enums: Joi.any().optional(),
}).unknown(true);

const taskSchema = Joi.object<RawAmoTaskResponse>({
    id: amoIdSchema,
    entity_id: Joi.alternatives(Joi.number(), Joi.string()).optional(),
    entity_type: Joi.string().optional(),
    is_completed: Joi.boolean().optional(),
    task_type_id: Joi.number().optional(),
    text: Joi.string().optional(),
    complete_till: Joi.number().optional(),
}).unknown(true);

export const amoTokenResponseSchema = Joi.object<RawAmoTokenResponse>({
    access_token: Joi.string().required(),
    refresh_token: Joi.string().required(),
}).unknown(true);

export const amoAccountResponseSchema = Joi.object<AmoAccountResponse>({
    id: amoIdSchema,
    subdomain: Joi.string().required(),
}).unknown(true);

export const amoCustomFieldListResponseSchema =
    Joi.object<RawAmoCustomFieldListResponse>({
        _page: Joi.number().optional(),
        _page_count: Joi.number().optional(),
        _embedded: Joi.object({
            custom_fields: Joi.array().items(customFieldSchema).optional(),
        })
            .optional()
            .unknown(true),
    }).unknown(true);

export const amoWebhookResponseSchema = Joi.object<AmoWebhookResponse>({
    id: amoIdSchema,
    destination: Joi.string().required(),
    disabled: Joi.boolean().required(),
    settings: Joi.array().items(Joi.string()).required(),
}).unknown(true);

export const amoContactResponseSchema = Joi.object<RawAmoContactResponse>({
    id: amoIdSchema,
    name: Joi.string().required(),
    custom_fields_values: Joi.array()
        .items(entityCustomFieldSchema)
        .allow(null)
        .optional(),
}).unknown(true);

export const amoLeadResponseSchema = Joi.object<RawAmoLeadResponse>({
    id: amoIdSchema,
    price: Joi.number().allow(null).optional(),
    custom_fields_values: Joi.array()
        .items(entityCustomFieldSchema)
        .allow(null)
        .optional(),
    _embedded: Joi.object({
        contacts: Joi.array()
            .items(
                Joi.object({
                    id: amoIdSchema,
                    is_main: Joi.boolean().optional(),
                }).unknown(true),
            )
            .optional(),
    })
        .optional()
        .unknown(true),
}).unknown(true);

export const amoTaskListResponseSchema = Joi.object<RawAmoTaskListResponse>({
    _page: Joi.number().optional(),
    _page_count: Joi.number().optional(),
    _embedded: Joi.object({
        tasks: Joi.array().items(taskSchema).optional(),
    })
        .optional()
        .unknown(true),
}).unknown(true);

export const amoTaskResponseSchema = taskSchema;
