import {
    AmoAccountResponse,
    AmoWebhookResponse,
    RawAmoCustomFieldListResponse,
    RawAmoCustomFieldResponse,
    RawAmoTokenResponse,
} from './amo-api.types';

export function isRawAmoTokenResponse(
    body: unknown,
): body is RawAmoTokenResponse {
    return (
        typeof body === 'object' &&
        body !== null &&
        'access_token' in body &&
        'refresh_token' in body &&
        typeof body.access_token === 'string' &&
        typeof body.refresh_token === 'string'
    );
}

export function isAmoAccountResponse(
    body: unknown,
): body is AmoAccountResponse {
    return (
        typeof body === 'object' &&
        body !== null &&
        'id' in body &&
        'subdomain' in body &&
        (typeof body.id === 'number' || typeof body.id === 'string') &&
        typeof body.subdomain === 'string'
    );
}

export function isRawAmoCustomFieldResponse(
    body: unknown,
): body is RawAmoCustomFieldResponse {
    return (
        typeof body === 'object' &&
        body !== null &&
        'id' in body &&
        'name' in body &&
        'type' in body &&
        (typeof body.id === 'number' || typeof body.id === 'string') &&
        typeof body.name === 'string' &&
        typeof body.type === 'string'
    );
}

export function isRawAmoCustomFieldListResponse(
    body: unknown,
): body is RawAmoCustomFieldListResponse {
    if (typeof body !== 'object' || body === null) {
        return false;
    }

    if (!('_embedded' in body)) {
        return true;
    }

    const embedded = body._embedded;

    if (typeof embedded !== 'object' || embedded === null) {
        return false;
    }

    if (!('custom_fields' in embedded)) {
        return true;
    }

    return (
        Array.isArray(embedded.custom_fields) &&
        embedded.custom_fields.every(isRawAmoCustomFieldResponse)
    );
}

export function isAmoWebhookResponse(
    body: unknown,
): body is AmoWebhookResponse {
    return (
        typeof body === 'object' &&
        body !== null &&
        'id' in body &&
        'destination' in body &&
        'disabled' in body &&
        'settings' in body &&
        (typeof body.id === 'number' || typeof body.id === 'string') &&
        typeof body.destination === 'string' &&
        typeof body.disabled === 'boolean' &&
        Array.isArray(body.settings) &&
        body.settings.every((setting) => typeof setting === 'string')
    );
}
