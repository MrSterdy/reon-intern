import { Injectable } from '@nestjs/common';
import { AmoContactResponse } from '../api/amo-api/amo-api.types';
import { isStringOrNumber } from '../../shared/helpers/object.helpers';
import { LeadPriceCalculationResult } from './lead.types';

@Injectable()
export class LeadPriceCalculatorService {
    public calculate(
        contact: AmoContactResponse,
        selectedServiceNames: string[],
        serviceFieldIds: ReadonlyMap<string, number>,
    ): LeadPriceCalculationResult {
        let price = 0;
        const missingServiceNames: string[] = [];

        for (const serviceName of selectedServiceNames) {
            const serviceFieldId = serviceFieldIds.get(serviceName);

            if (serviceFieldId === undefined) {
                missingServiceNames.push(serviceName);
                continue;
            }

            const serviceValue = this.extractNumericFieldValue(
                contact,
                serviceFieldId,
            );

            if (serviceValue === null) {
                missingServiceNames.push(serviceName);
                continue;
            }

            price += serviceValue;
        }

        return {
            price,
            missingServiceNames,
        };
    }

    private extractNumericFieldValue(
        contact: AmoContactResponse,
        fieldId: number,
    ): number | null {
        const field =
            contact.customFields.find(
                (field) => Number(field.field_id) === fieldId,
            ) ?? null;
        const value = field?.values?.[0]?.value;

        if (!isStringOrNumber(value)) {
            return null;
        }

        const numericValue = Number(value);

        return Number.isFinite(numericValue) ? numericValue : null;
    }
}
