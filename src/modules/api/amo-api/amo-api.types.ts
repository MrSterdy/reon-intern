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
