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
