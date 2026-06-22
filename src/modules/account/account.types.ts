export type InstallAccountPayload = {
    accountId: string;
    subdomain: string;
    accessToken: string;
    refreshToken: string;
};

export type UpdateAccountTokensPayload = {
    accountId: string;
    accessToken: string;
    refreshToken: string;
};

export type AmoOauthInstallCommand = {
    code: string;
    referer: string;
    state?: string;
    fromWidget?: string;
    platform?: number;
    redirectUri?: string;
};

export type AmoOauthUninstallCommand = {
    accountId: string;
    clientUuid: string;
    signature: string;
};
