import { Injectable } from '@nestjs/common';
import { AmoContactResponse } from '../api/amo-api/amo-api.types';
import { extractNumericFieldValue } from '../api/amo-api/amo-api.helpers';
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

            const serviceValue = extractNumericFieldValue(
                contact.customFields,
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
}
