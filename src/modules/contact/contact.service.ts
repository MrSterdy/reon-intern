import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity } from '../account/account.entity';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { AmoContactResponse } from '../api/amo-api/amo-api.types';
import { CUSTOM_FIELD_NAMES } from '../custom-field/custom-field.consts';
import { CustomFieldService } from '../custom-field/custom-field.service';
import { calculateAgeFromBirthTimestamp } from './contact.helpers';
import { isStringOrNumber } from '../../shared/helpers/object.helpers';
import { REQUIRED_CONTACT_FIELD_NAMES } from './contact.consts';

@Injectable()
export class ContactService {
    private readonly logger = new Logger(ContactService.name);

    public constructor(
        private readonly amoApiService: AmoApiService,
        private readonly customFieldService: CustomFieldService,
    ) {}

    public async ensureAgeForContact(
        account: AccountEntity,
        contactId: string,
    ): Promise<number | null> {
        if (account.accessToken === null) {
            return null;
        }

        const fieldIds =
            await this.customFieldService.getContactAmoFieldIdsByNames(
                account.id,
                [...REQUIRED_CONTACT_FIELD_NAMES],
            );
        const birthDateFieldId = fieldIds.get(CUSTOM_FIELD_NAMES.BirthDate);
        const ageFieldId = fieldIds.get(CUSTOM_FIELD_NAMES.Age);

        if (birthDateFieldId === undefined || ageFieldId === undefined) {
            this.logger.warn(
                `Required contact fields are not synced for account ${account.accountId}`,
            );
            return null;
        }

        const contact = await this.amoApiService.getContact(
            account.subdomain,
            account.accessToken,
            contactId,
        );

        if (contact === null) {
            return null;
        }

        const birthTimestamp = this.extractNumericFieldValue(
            contact,
            birthDateFieldId,
        );
        const calculatedAge =
            birthTimestamp !== null
                ? calculateAgeFromBirthTimestamp(birthTimestamp)
                : null;
        const currentAge = this.extractNumericFieldValue(contact, ageFieldId);

        if (calculatedAge === null) {
            return currentAge;
        }

        if (currentAge === calculatedAge) {
            return currentAge;
        }

        await this.amoApiService.updateContact(
            account.subdomain,
            account.accessToken,
            contactId,
            {
                custom_fields_values: [
                    {
                        field_id: ageFieldId,
                        values: [{ value: calculatedAge }],
                    },
                ],
            },
        );

        return calculatedAge;
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
