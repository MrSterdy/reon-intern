import {
    AmoContactResponse,
    AmoCustomFieldListResponse,
    AmoCustomFieldResponse,
    AmoLeadResponse,
    AmoTaskListResponse,
    AmoTaskResponse,
    AmoTokenResponse,
    AmoWebhookListResponse,
    RawAmoContactResponse,
    RawAmoCustomFieldListResponse,
    RawAmoLeadResponse,
    RawAmoTaskListResponse,
    RawAmoTaskResponse,
    RawAmoTokenResponse,
    RawAmoWebhookListResponse,
} from './amo-api.types';

export function mapAmoTokenResponse(
    body: RawAmoTokenResponse,
): AmoTokenResponse {
    return {
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
    };
}

export function mapAmoCustomFieldListResponse(
    body: RawAmoCustomFieldListResponse,
): AmoCustomFieldListResponse {
    const customFields = body._embedded?.custom_fields ?? [];

    return {
        pageCount: body._page_count,
        customFields: customFields.map(
            (customField): AmoCustomFieldResponse => {
                return {
                    id: customField.id,
                    name: customField.name,
                    type: customField.type,
                    ...(customField.enums == null
                        ? {}
                        : { enums: customField.enums }),
                };
            },
        ),
    };
}

export function mapAmoWebhookListResponse(
    body: RawAmoWebhookListResponse,
): AmoWebhookListResponse {
    return {
        webhooks: body._embedded?.webhooks ?? [],
    };
}

export function mapAmoContactResponse(
    body: RawAmoContactResponse,
): AmoContactResponse {
    return {
        id: body.id,
        name: body.name,
        customFields: body.custom_fields_values ?? [],
    };
}

export function mapAmoLeadResponse(body: RawAmoLeadResponse): AmoLeadResponse {
    return {
        id: body.id,
        price: typeof body.price === 'number' ? body.price : 0,
        customFields: body.custom_fields_values ?? [],
        contacts:
            body._embedded?.contacts?.map((contact) => ({
                id: contact.id,
                isMain: contact.is_main === true,
            })) ?? [],
    };
}

export function mapAmoTaskResponse(body: RawAmoTaskResponse): AmoTaskResponse {
    return {
        id: body.id,
        entityId: body.entity_id ?? 0,
        entityType: body.entity_type ?? '',
        isCompleted: body.is_completed === true,
        taskTypeId:
            typeof body.task_type_id === 'number' ? body.task_type_id : 0,
        text: body.text ?? '',
        completeTill:
            typeof body.complete_till === 'number' ? body.complete_till : 0,
    };
}

export function mapAmoTaskListResponse(
    body: RawAmoTaskListResponse,
): AmoTaskListResponse {
    return {
        pageCount: body._page_count,
        tasks: body._embedded?.tasks?.map(mapAmoTaskResponse) ?? [],
    };
}
