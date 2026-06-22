export function isStringOrNumber(value: unknown): value is string | number {
    return typeof value === 'string' || typeof value === 'number';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
