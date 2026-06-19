import { AmoAccountResponse, RawAmoTokenResponse } from './amo-api.types';

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
