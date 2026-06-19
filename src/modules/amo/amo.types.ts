export type AmoOauthResult = {
    status: 'installed' | 'uninstalled';
};

export type AmoUninstallHookSignaturePayload = {
    accountId: string;
    clientId: string;
    clientSecret: string;
    signature: string;
};
