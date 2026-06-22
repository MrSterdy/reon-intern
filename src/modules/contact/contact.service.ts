import { Injectable, Logger } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { AmoContactResponse } from '../api/amo-api/amo-api.types';
import { CustomFieldName } from '../custom-field/custom-field.consts';
import { CustomFieldService } from '../custom-field/custom-field.service';
import { calculateAgeFromBirthTimestamp } from './contact.helpers';
import {
    ContactWebhookAction,
    ContactWebhookBody,
    ContactWebhookEntry,
} from './contact.types';
import {
    isRecord,
    isStringOrNumber,
} from '../../shared/helpers/object.helpers';
import { REQUIRED_CONTACT_FIELD_NAMES } from './contact.consts';

@Injectable()
export class ContactService {
    private readonly logger = new Logger(ContactService.name);

    public constructor(
        private readonly accountService: AccountService,
        private readonly amoApiService: AmoApiService,
        private readonly customFieldService: CustomFieldService,
    ) {}

    public async handleWebhook(
        body: ContactWebhookBody,
        action: ContactWebhookAction,
    ): Promise<void> {
        const entries = this.extractWebhookEntries(body, action);

        for (const entry of entries) {
            try {
                await this.processWebhookEntry(entry);
            } catch (error) {
                this.logger.error(
                    `Failed to process amoCRM contact ${entry.contactId} for account ${entry.accountId}`,
                    error instanceof Error ? error.stack : undefined,
                );
            }
        }
    }

    private async processWebhookEntry(
        entry: ContactWebhookEntry,
    ): Promise<void> {
        const account = await this.accountService.findInstalledByAccountId(
            entry.accountId,
        );

        if (account === null || account.accessToken === null) {
            return;
        }

        const fieldIds =
            await this.customFieldService.getContactAmoFieldIdsByNames(
                account.id,
                [...REQUIRED_CONTACT_FIELD_NAMES],
            );
        const birthDateFieldId = fieldIds.get(CustomFieldName.BirthDate);
        const ageFieldId = fieldIds.get(CustomFieldName.Age);

        if (birthDateFieldId === undefined || ageFieldId === undefined) {
            this.logger.warn(
                `Required contact fields are not synced for account ${account.accountId}`,
            );
            return;
        }

        const contact = await this.amoApiService.getContact(
            account.subdomain,
            account.accessToken,
            entry.contactId,
        );

        if (contact === null) {
            return;
        }

        const calculatedAge = this.calculateContactAge(
            contact,
            birthDateFieldId,
        );

        if (calculatedAge === null) {
            return;
        }

        const currentAge = this.extractNumericFieldValue(contact, ageFieldId);

        if (currentAge === calculatedAge) {
            return;
        }

        await this.amoApiService.updateContact(
            account.subdomain,
            account.accessToken,
            entry.contactId,
            {
                custom_fields_values: [
                    {
                        field_id: ageFieldId,
                        values: [{ value: calculatedAge }],
                    },
                ],
            },
        );
    }

    private calculateContactAge(
        contact: AmoContactResponse,
        birthDateFieldId: number,
    ): number | null {
        const birthTimestamp = this.extractNumericFieldValue(
            contact,
            birthDateFieldId,
        );

        if (birthTimestamp === null) {
            return null;
        }

        return calculateAgeFromBirthTimestamp(birthTimestamp);
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

    private extractWebhookEntries(
        body: ContactWebhookBody,
        action: ContactWebhookAction,
    ): ContactWebhookEntry[] {
        const contacts = body.contacts;

        if (!isRecord(contacts)) {
            return [];
        }

        const entries = contacts[action];
        const rawEntries = isRecord(entries) ? Object.values(entries) : [];

        return rawEntries
            .map((entry) => this.normalizeEntry(entry))
            .filter((entry): entry is ContactWebhookEntry => entry !== null);
    }

    private normalizeEntry(entry: unknown): ContactWebhookEntry | null {
        if (!isRecord(entry) || entry.type !== 'contact') {
            return null;
        }

        if (
            !isStringOrNumber(entry.id) ||
            !isStringOrNumber(entry.account_id)
        ) {
            return null;
        }

        return {
            contactId: String(entry.id),
            accountId: String(entry.account_id),
        };
    }
}
