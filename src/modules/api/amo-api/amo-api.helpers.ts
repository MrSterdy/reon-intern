import { RawAmoEntityCustomField } from './amo-api.types';

export function extractNumericFieldValue(
    customFields: RawAmoEntityCustomField[],
    fieldId: number,
): number | null {
    const field =
        customFields.find((field) => Number(field.field_id) === fieldId) ??
        null;
    const value = field?.values?.[0]?.value;

    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue) ? numericValue : null;
}
