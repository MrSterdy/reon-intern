export type AmoTokenResponse = {
    accessToken: string;
    refreshToken: string;
};

export type RawAmoTokenResponse = {
    access_token: string;
    refresh_token: string;
};

export type AmoAccountResponse = {
    id: number | string;
    subdomain: string;
};

export type AmoCustomFieldEntityType = 'contacts' | 'leads';

export type AmoCustomFieldType = 'date' | 'numeric' | 'multiselect';

export type AmoCustomFieldEnumPayload = {
    value: string;
    sort: number;
};

export type AmoCustomFieldPayload = {
    name: string;
    type: AmoCustomFieldType;
    enums?: AmoCustomFieldEnumPayload[];
};

export type RawAmoCustomFieldResponse = {
    id: number | string;
    name: string;
    type: string;
    enums?: unknown;
};

export type RawAmoCustomFieldListResponse = {
    _page?: number;
    _page_count?: number;
    _embedded?: {
        custom_fields?: RawAmoCustomFieldResponse[];
    };
};

export type AmoCustomFieldResponse = {
    id: number | string;
    name: string;
    type: string;
};

export type AmoWebhookEvent =
    | 'add_contact'
    | 'update_contact'
    | 'add_lead'
    | 'update_lead';

export type AmoWebhookPayload = {
    destination: string;
    settings: AmoWebhookEvent[];
};

export type AmoWebhookResponse = {
    id: number | string;
    destination: string;
    disabled: boolean;
    settings: string[];
};
