import { Injectable, Logger } from '@nestjs/common';
import { AccountEntity } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import {
    AmoContactResponse,
    AmoLeadContactResponse,
    AmoLeadResponse,
} from '../api/amo-api/amo-api.types';
import {
    CustomFieldName,
    SERVICE_CUSTOM_FIELD_NAMES,
} from '../custom-field/custom-field.consts';
import { CustomFieldService } from '../custom-field/custom-field.service';
import { ContactService } from '../contact/contact.service';
import { isStringOrNumber } from '../../shared/helpers/object.helpers';
import { LeadPriceCalculatorService } from './lead-price-calculator.service';
import { LeadTaskService } from './lead-task.service';
import { REQUIRED_LEAD_FIELD_NAMES } from './lead.consts';
import { LeadWebhookEntry } from './lead.types';

@Injectable()
export class LeadService {
    private readonly logger = new Logger(LeadService.name);

    public constructor(
        private readonly accountService: AccountService,
        private readonly amoApiService: AmoApiService,
        private readonly customFieldService: CustomFieldService,
        private readonly contactService: ContactService,
        private readonly priceCalculator: LeadPriceCalculatorService,
        private readonly leadTaskService: LeadTaskService,
    ) {}

    public async handleWebhook(entries: LeadWebhookEntry[]): Promise<void> {
        for (const entry of entries) {
            try {
                await this.processWebhookEntry(entry);
            } catch (error) {
                this.logger.error(
                    `Failed to process amoCRM lead ${entry.leadId} for account ${entry.accountId}`,
                    error instanceof Error ? error.stack : undefined,
                );
            }
        }
    }

    private async processWebhookEntry(entry: LeadWebhookEntry): Promise<void> {
        const account = await this.accountService.findInstalledByAccountId(
            entry.accountId,
        );

        if (account === null || account.accessToken === null) {
            return;
        }

        const leadFieldIds =
            await this.customFieldService.getLeadAmoFieldIdsByNames(
                account.id,
                [...REQUIRED_LEAD_FIELD_NAMES],
            );
        const servicesFieldId = leadFieldIds.get(CustomFieldName.Services);

        if (servicesFieldId === undefined) {
            this.logger.warn(
                `Required lead fields are not synced for account ${account.accountId}`,
            );
            return;
        }

        const lead = await this.amoApiService.getLead(
            account.subdomain,
            account.accessToken,
            entry.leadId,
        );

        if (lead === null) {
            return;
        }

        await this.processLead(
            account,
            account.accessToken,
            lead,
            String(lead.id),
            servicesFieldId,
        );
    }

    private async processLead(
        account: AccountEntity,
        accessToken: string,
        lead: AmoLeadResponse,
        leadId: string,
        servicesFieldId: number,
    ): Promise<void> {
        const selectedServiceNames = this.extractSelectedServiceNames(
            lead,
            servicesFieldId,
        );

        if (selectedServiceNames.length === 0) {
            return;
        }

        const mainContactId = this.extractMainContactId(lead.contacts);

        if (mainContactId === null) {
            this.logger.warn(
                `Main contact is missing for amoCRM lead ${leadId}`,
            );
            return;
        }

        const contact = await this.amoApiService.getContact(
            account.subdomain,
            accessToken,
            mainContactId,
        );

        if (contact === null) {
            return;
        }

        const contactFieldIds =
            await this.customFieldService.getContactAmoFieldIdsByNames(
                account.id,
                [...selectedServiceNames, CustomFieldName.Age],
            );
        const calculation = this.priceCalculator.calculate(
            contact,
            selectedServiceNames,
            contactFieldIds,
        );

        if (calculation.missingServiceNames.length > 0) {
            await this.leadTaskService.upsertMissingServiceFieldsTask(
                account,
                leadId,
                calculation.missingServiceNames,
            );
            return;
        }

        const age = await this.resolveContactAge(
            account,
            contact,
            mainContactId,
            contactFieldIds,
        );

        if (age === null) {
            await this.leadTaskService.upsertUnknownAgeTask(account, leadId);
            return;
        }

        if (lead.price !== calculation.price) {
            await this.amoApiService.updateLeadPrice(
                account.subdomain,
                accessToken,
                leadId,
                calculation.price,
            );
        }

        await this.leadTaskService.upsertCheckServicePriceTask(
            account,
            leadId,
            contact.name,
            age,
        );
    }

    private async resolveContactAge(
        account: AccountEntity,
        contact: AmoContactResponse,
        contactId: string,
        contactFieldIds: ReadonlyMap<string, number>,
    ): Promise<number | null> {
        const ageFieldId = contactFieldIds.get(CustomFieldName.Age);

        if (ageFieldId === undefined) {
            this.logger.warn(
                `Required contact age field is not synced for account ${account.accountId}`,
            );
            return null;
        }

        const currentAge = this.extractNumericFieldValue(contact, ageFieldId);

        if (currentAge !== null) {
            return currentAge;
        }

        return this.contactService.ensureAgeForContact(account, contactId);
    }

    private extractSelectedServiceNames(
        lead: AmoLeadResponse,
        servicesFieldId: number,
    ): string[] {
        const field =
            lead.customFields.find(
                (field) => Number(field.field_id) === servicesFieldId,
            ) ?? null;
        const values = field?.values ?? [];
        const serviceNames = values.flatMap((value) => {
            if (typeof value.value !== 'string') {
                return [];
            }

            if (!this.isServiceFieldName(value.value)) {
                return [];
            }

            return [value.value];
        });

        return [...new Set(serviceNames)];
    }

    private isServiceFieldName(fieldName: string): boolean {
        return (SERVICE_CUSTOM_FIELD_NAMES as readonly string[]).includes(
            fieldName,
        );
    }

    private extractMainContactId(
        contacts: AmoLeadContactResponse[],
    ): string | null {
        const mainContact = contacts.find((contact) => contact.isMain) ?? null;

        return mainContact === null ? null : String(mainContact.id);
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
