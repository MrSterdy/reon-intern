import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountEntity } from '../account/account.entity';
import { AccountService } from '../account/account.service';
import { extractNumericFieldValue } from '../api/amo-api/amo-api.helpers';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import {
    AmoContactResponse,
    AmoLeadResponse,
    RawAmoEntityCustomField,
} from '../api/amo-api/amo-api.types';
import {
    CUSTOM_FIELD_NAMES,
    SERVICE_CUSTOM_FIELD_NAMES,
} from '../custom-field/custom-field.consts';
import { CustomFieldService } from '../custom-field/custom-field.service';
import { ContactService } from '../contact/contact.service';
import { Env } from '../../shared/enums/env.enum';
import {
    CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX,
    LEAD_TASK_DEADLINE_SECONDS,
    MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX,
    REQUIRED_LEAD_FIELD_NAMES,
    UNKNOWN_AGE_TASK_TEXT,
} from './lead.consts';
import {
    LeadPriceCalculationResult,
    LeadWebhookEntry,
    UpsertTaskPayload,
} from './lead.types';

@Injectable()
export class LeadService {
    private readonly logger = new Logger(LeadService.name);

    public constructor(
        private readonly accountService: AccountService,
        private readonly amoApiService: AmoApiService,
        private readonly configService: ConfigService,
        private readonly customFieldService: CustomFieldService,
        private readonly contactService: ContactService,
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
        const servicesFieldId = leadFieldIds.get(CUSTOM_FIELD_NAMES.Services);

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
            lead.customFields,
            servicesFieldId,
        );

        if (selectedServiceNames.length === 0) {
            return;
        }

        const rawMainContactId =
            lead.contacts.find((contact) => contact.isMain)?.id ?? null;
        if (rawMainContactId === null) {
            this.logger.warn(
                `Main contact is missing for amoCRM lead ${leadId}`,
            );
            return;
        }

        const mainContactId = String(rawMainContactId);

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
                [...selectedServiceNames, CUSTOM_FIELD_NAMES.Age],
            );
        const calculation = this.calculatePrice(
            contact,
            selectedServiceNames,
            contactFieldIds,
        );

        if (calculation.missingServiceNames.length > 0) {
            const text = `${MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX}${calculation.missingServiceNames.join(', ')}`;
            const errorTaskTypeId = this.configService.getOrThrow<number>(
                Env.AmoErrorTaskTypeId,
            );

            await this.upsertTask({
                account,
                leadId,
                taskTypeId: errorTaskTypeId,
                text,
                textPrefix: MISSING_SERVICE_FIELDS_TASK_TEXT_PREFIX,
            });

            return;
        }

        const age = await this.resolveContactAge(
            account,
            contact,
            mainContactId,
            contactFieldIds,
        );

        if (age === null) {
            const errorTaskTypeId = this.configService.getOrThrow<number>(
                Env.AmoErrorTaskTypeId,
            );

            await this.upsertTask({
                account,
                leadId,
                taskTypeId: errorTaskTypeId,
                text: UNKNOWN_AGE_TASK_TEXT,
                textPrefix: UNKNOWN_AGE_TASK_TEXT,
            });

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

        const checkTaskTypeId = this.configService.getOrThrow<number>(
            Env.AmoCheckTaskTypeId,
        );
        const text = `${CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX}${contact.name}, возраст: ${age}`;

        await this.upsertTask({
            account,
            leadId,
            taskTypeId: checkTaskTypeId,
            text,
            textPrefix: CHECK_SERVICE_PRICE_TASK_TEXT_PREFIX,
        });
    }

    private async resolveContactAge(
        account: AccountEntity,
        contact: AmoContactResponse,
        contactId: string,
        contactFieldIds: ReadonlyMap<string, number>,
    ): Promise<number | null> {
        const ageFieldId = contactFieldIds.get(CUSTOM_FIELD_NAMES.Age);

        if (ageFieldId === undefined) {
            this.logger.warn(
                `Required contact age field is not synced for account ${account.accountId}`,
            );
            return null;
        }

        const currentAge = extractNumericFieldValue(
            contact.customFields,
            ageFieldId,
        );

        if (currentAge !== null) {
            return currentAge;
        }

        return this.contactService.ensureAgeForContact(account, contactId);
    }

    private calculatePrice(
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

    private async upsertTask(payload: UpsertTaskPayload): Promise<void> {
        const { account, leadId, taskTypeId, text, textPrefix } = payload;

        if (account.accessToken === null) {
            return;
        }

        const existingTasks = await this.amoApiService.getLeadTasks(
            account.subdomain,
            account.accessToken,
            leadId,
            taskTypeId,
        );
        const existingTask =
            existingTasks.find((task) => task.text.startsWith(textPrefix)) ??
            null;

        const taskCompleteTill =
            Math.floor(Date.now() / 1000) + LEAD_TASK_DEADLINE_SECONDS;

        if (existingTask === null) {
            await this.amoApiService.createTask(
                account.subdomain,
                account.accessToken,
                {
                    entity_id: Number(leadId),
                    entity_type: 'leads',
                    task_type_id: taskTypeId,
                    text,
                    complete_till: taskCompleteTill,
                },
            );
            return;
        }

        if (existingTask.text === text) {
            return;
        }

        await this.amoApiService.updateTask(
            account.subdomain,
            account.accessToken,
            String(existingTask.id),
            {
                task_type_id: taskTypeId,
                text,
                complete_till: taskCompleteTill,
            },
        );
    }

    private extractSelectedServiceNames(
        customFields: RawAmoEntityCustomField[],
        servicesFieldId: number,
    ): string[] {
        const field =
            customFields.find(
                (field) => Number(field.field_id) === servicesFieldId,
            ) ?? null;
        const values = field?.values ?? [];
        const serviceNames = values
            .map((value) => value.value)
            .filter(
                (value): value is string =>
                    typeof value === 'string' &&
                    (SERVICE_CUSTOM_FIELD_NAMES as readonly string[]).includes(
                        value,
                    ),
            );

        return [...new Set(serviceNames)];
    }
}
