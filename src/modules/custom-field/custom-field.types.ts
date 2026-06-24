import type {
    AmoCustomFieldEntityType,
    AmoCustomFieldType,
} from '../api/amo-api/amo-api.types';

export type { AmoCustomFieldEntityType, AmoCustomFieldType };

export type AmoCustomFieldEnum = {
    value: string;
    sort: number;
};

export type RequiredCustomField = {
    entityType: AmoCustomFieldEntityType;
    fieldName: string;
    fieldType: AmoCustomFieldType;
    enums?: AmoCustomFieldEnum[];
};

export type SaveCustomFieldPayload = {
    accountId: string;
    entityType: AmoCustomFieldEntityType;
    fieldName: string;
    fieldType: AmoCustomFieldType;
    fieldId: string;
};

export type SyncedAmoCustomField = {
    id: number | string;
    name: string;
    type: string;
    enums?: AmoCustomFieldEnum[];
};
