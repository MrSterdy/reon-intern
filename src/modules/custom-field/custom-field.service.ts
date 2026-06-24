import { BadGatewayException, Injectable } from '@nestjs/common';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { AmoCustomFieldEntityType } from '../api/amo-api/amo-api.types';
import { AccountEntity } from '../account/account.entity';
import {
    CUSTOM_FIELD_ENTITY_TYPES,
    REQUIRED_CUSTOM_FIELDS,
} from './custom-field.consts';
import { CustomFieldRepository } from './custom-field.repository';
import {
    AmoCustomFieldEnum,
    RequiredCustomField,
    SaveCustomFieldPayload,
    SyncedAmoCustomField,
} from './custom-field.types';

@Injectable()
export class CustomFieldService {
    public constructor(
        private readonly amoApiService: AmoApiService,
        private readonly customFieldRepository: CustomFieldRepository,
    ) {}

    public async syncForAccount(account: AccountEntity): Promise<void> {
        if (account.accessToken === null) {
            throw new BadGatewayException(
                'amoCRM account access token is missing',
            );
        }

        const payloads: SaveCustomFieldPayload[] = [];

        for (const entityType of CUSTOM_FIELD_ENTITY_TYPES) {
            payloads.push(
                ...(await this.syncEntityFields(
                    account,
                    account.accessToken,
                    entityType,
                )),
            );
        }

        await this.customFieldRepository.saveCustomFields(payloads);
    }

    public async getContactAmoFieldIdsByNames(
        accountId: string,
        fieldNames: string[],
    ): Promise<Map<string, number>> {
        return this.getAmoFieldIdsByNames(accountId, 'contacts', fieldNames);
    }

    public async getLeadAmoFieldIdsByNames(
        accountId: string,
        fieldNames: string[],
    ): Promise<Map<string, number>> {
        return this.getAmoFieldIdsByNames(accountId, 'leads', fieldNames);
    }

    private async getAmoFieldIdsByNames(
        accountId: string,
        entityType: AmoCustomFieldEntityType,
        fieldNames: string[],
    ): Promise<Map<string, number>> {
        const customFields = await this.customFieldRepository.findFieldsByNames(
            accountId,
            entityType,
            fieldNames,
        );

        return new Map(
            customFields.flatMap((customField) => {
                const amoFieldId = Number(customField.fieldId);

                if (!Number.isInteger(amoFieldId) || amoFieldId <= 0) {
                    return [];
                }

                return [[customField.fieldName, amoFieldId]];
            }),
        );
    }

    private async syncEntityFields(
        account: AccountEntity,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
    ): Promise<SaveCustomFieldPayload[]> {
        const requiredFields = REQUIRED_CUSTOM_FIELDS.filter(
            (requiredField) => requiredField.entityType === entityType,
        );
        const existingFields = await this.amoApiService.getCustomFields(
            account.subdomain,
            accessToken,
            entityType,
        );
        const missingFields = requiredFields
            .filter(
                (requiredField) =>
                    this.findMatchedField(existingFields, requiredField) ===
                    null,
            )
            .map((field) => ({
                name: field.fieldName,
                type: field.fieldType,
                ...(field.enums === undefined ? {} : { enums: field.enums }),
            }));
        const createdFields =
            missingFields.length === 0
                ? []
                : await this.amoApiService.createCustomFields(
                      account.subdomain,
                      accessToken,
                      entityType,
                      missingFields,
                  );
        const syncedFields = [...existingFields, ...createdFields];
        const payloads: SaveCustomFieldPayload[] = [];

        for (const requiredField of requiredFields) {
            const syncedField = this.findMatchedField(
                syncedFields,
                requiredField,
            );

            if (syncedField === null) {
                throw new BadGatewayException(
                    `amoCRM custom field ${requiredField.fieldName} was not synced`,
                );
            }

            payloads.push({
                accountId: account.id,
                entityType: requiredField.entityType,
                fieldName: requiredField.fieldName,
                fieldType: requiredField.fieldType,
                fieldId: String(syncedField.id),
            });
        }

        return payloads;
    }

    private findMatchedField(
        fields: SyncedAmoCustomField[],
        requiredField: RequiredCustomField,
    ): SyncedAmoCustomField | null {
        return (
            fields.find(
                (field) =>
                    field.name === requiredField.fieldName &&
                    field.type === requiredField.fieldType &&
                    this.hasMatchedEnums(field.enums, requiredField.enums),
            ) ?? null
        );
    }

    private hasMatchedEnums(
        fieldEnums: AmoCustomFieldEnum[] | undefined,
        requiredEnums: AmoCustomFieldEnum[] | undefined,
    ): boolean {
        if (requiredEnums === undefined) {
            return true;
        }

        if (
            fieldEnums === undefined ||
            fieldEnums.length !== requiredEnums.length
        ) {
            return false;
        }

        const fieldEnumValues = new Set(
            fieldEnums.map((fieldEnum) => fieldEnum.value),
        );

        return requiredEnums.every((requiredEnum) =>
            fieldEnumValues.has(requiredEnum.value),
        );
    }
}
