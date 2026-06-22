export type AmoOauthResult = {
    status: 'installed' | 'uninstalled';
};

export type AmoOauthInstallQuery = {
    code: string;
    referer: string;
    state?: string;
    from_widget?: string;
    platform?: number;
    redirectUri?: string;
};

export type AmoOauthUninstallQuery = {
    account_id: string;
    client_uuid: string;
    signature: string;
};

export type AmoUninstallHookSignaturePayload = {
    accountId: string;
    clientId: string;
    clientSecret: string;
    signature: string;
};
