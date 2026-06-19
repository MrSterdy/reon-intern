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
