import type * as Joi from 'joi';

export type RequestJsonStatusAction<TResponse> = {
    errorMessage?: string;
    response?: TResponse | null;
};

export type RequestJsonStatusActions<TResponse> = Readonly<
    Partial<Record<number, RequestJsonStatusAction<TResponse>>> & {
        default: RequestJsonStatusAction<TResponse>;
    }
>;

export type AmoTokenResponse = {
    accessToken: string;
    refreshToken: string;
};

export type RawAmoTokenResponse = {
    access_token: string;
    refresh_token: string;
};

export type AmoAccountResponse = {
    id: number | string;
    subdomain: string;
};

export type AmoCustomFieldEntityType = 'contacts' | 'leads';

export type AmoCustomFieldType = 'date' | 'numeric' | 'multiselect';

export type AmoCustomFieldEnumPayload = {
    value: string;
    sort: number;
};

export type AmoCustomFieldPayload = {
    name: string;
    type: AmoCustomFieldType;
    enums?: AmoCustomFieldEnumPayload[];
};

export type RawAmoCustomFieldResponse = {
    id: number | string;
    name: string;
    type: string;
    enums?: unknown;
};

export type RawAmoCustomFieldListResponse = {
    _page?: number;
    _page_count?: number;
    _embedded?: {
        custom_fields?: RawAmoCustomFieldResponse[];
    };
};

export type AmoCustomFieldResponse = {
    id: number | string;
    name: string;
    type: string;
};

export type AmoCustomFieldListResponse = {
    pageCount?: number;
    customFields: AmoCustomFieldResponse[];
};

export type AmoWebhookEvent =
    | 'add_contact'
    | 'update_contact'
    | 'add_lead'
    | 'update_lead';

export type AmoWebhookPayload = {
    destination: string;
    settings: AmoWebhookEvent[];
};

export type AmoWebhookResponse = {
    id: number | string;
    destination: string;
    disabled: boolean;
    settings: string[];
};

export type RawAmoCustomFieldValue = {
    value?: number | string | null;
    enum_id?: number | string;
    enum?: number | string;
};

export type RawAmoEntityCustomField = {
    field_id: number | string;
    field_name?: string;
    field_type?: string;
    values?: RawAmoCustomFieldValue[];
};

export type AmoContactResponse = {
    id: number | string;
    name: string;
    customFields: RawAmoEntityCustomField[];
};

export type RawAmoContactResponse = {
    id: number | string;
    name: string;
    custom_fields_values?: RawAmoEntityCustomField[] | null;
};

export type AmoContactCustomFieldPayload = {
    field_id: number;
    values: Array<{
        value: number | string;
    }>;
};

export type AmoContactUpdatePayload = {
    custom_fields_values: AmoContactCustomFieldPayload[];
};

export type RawAmoLeadEmbeddedContact = {
    id: number | string;
    is_main?: boolean;
};

export type RawAmoLeadResponse = {
    id: number | string;
    price?: number | null;
    custom_fields_values?: RawAmoEntityCustomField[] | null;
    _embedded?: {
        contacts?: RawAmoLeadEmbeddedContact[];
    };
};

export type AmoLeadContactResponse = {
    id: number | string;
    isMain: boolean;
};

export type AmoLeadResponse = {
    id: number | string;
    price: number;
    customFields: RawAmoEntityCustomField[];
    contacts: AmoLeadContactResponse[];
};

export type AmoLeadUpdatePayload = {
    price: number;
};

export type AmoTaskEntityType = 'leads';

export type RawAmoTaskResponse = {
    id: number | string;
    entity_id?: number | string;
    entity_type?: string;
    is_completed?: boolean;
    task_type_id?: number;
    text?: string;
    complete_till?: number;
};

export type RawAmoTaskListResponse = {
    _page?: number;
    _page_count?: number;
    _embedded?: {
        tasks?: RawAmoTaskResponse[];
    };
};

export type AmoTaskResponse = {
    id: number | string;
    entityId: number | string;
    entityType: string;
    isCompleted: boolean;
    taskTypeId: number;
    text: string;
    completeTill: number;
};

export type AmoTaskListResponse = {
    pageCount?: number;
    tasks: AmoTaskResponse[];
};

export type AmoTaskPayload = {
    entity_id: number;
    entity_type: AmoTaskEntityType;
    task_type_id: number;
    text: string;
    complete_till: number;
};

export type AmoTaskUpdatePayload = {
    task_type_id?: number;
    text?: string;
    complete_till?: number;
};

export type AmoApiResponseValidator<TResponse> = (
    body: unknown,
    invalidResponseMessage: string,
) => TResponse;

export type AmoResponseMapper<TRawResponse, TResponse> = (
    body: TRawResponse,
) => TResponse;

export type AmoResponseValidatorConfig<TRawResponse, TResponse> = {
    schema: Joi.ObjectSchema<TRawResponse>;
    map?: AmoResponseMapper<TRawResponse, TResponse>;
};
