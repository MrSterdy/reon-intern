import { BadGatewayException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    isAmoAccountResponse,
    isRawAmoCustomFieldListResponse,
    isRawAmoTokenResponse,
} from './amo-api.guards';
import {
    AmoAccountResponse,
    AmoCustomFieldEntityType,
    AmoCustomFieldPayload,
    AmoCustomFieldResponse,
    AmoTokenResponse,
    RawAmoCustomFieldListResponse,
    RawAmoTokenResponse,
} from './amo-api.types';
import { ResponseGuard } from '../api.types';

@Injectable()
export class AmoApiService {
    public constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    public async exchangeAuthorizationCode(
        referer: string,
        code: string,
        redirectUri?: string,
    ): Promise<AmoTokenResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);
        const body = await this.requestJson<RawAmoTokenResponse>(
            `${accountBaseUrl}/oauth2/access_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    client_id:
                        this.configService.getOrThrow<string>('amo.clientId'),
                    client_secret:
                        this.configService.getOrThrow<string>(
                            'amo.clientSecret',
                        ),
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri:
                        redirectUri ??
                        this.configService.getOrThrow<string>(
                            'amo.redirectUri',
                        ),
                },
            },
            isRawAmoTokenResponse,
            'amoCRM token response is invalid',
        );

        return {
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
        };
    }

    public async refreshAccessToken(
        referer: string,
        refreshToken: string,
    ): Promise<AmoTokenResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);
        const body = await this.requestJson<RawAmoTokenResponse>(
            `${accountBaseUrl}/oauth2/access_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    client_id:
                        this.configService.getOrThrow<string>('amo.clientId'),
                    client_secret:
                        this.configService.getOrThrow<string>(
                            'amo.clientSecret',
                        ),
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    redirect_uri:
                        this.configService.getOrThrow<string>(
                            'amo.redirectUri',
                        ),
                },
            },
            isRawAmoTokenResponse,
            'amoCRM token refresh response is invalid',
        );

        return {
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
        };
    }

    public async getAccount(
        referer: string,
        accessToken: string,
    ): Promise<AmoAccountResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);
        const body = await this.requestJson<AmoAccountResponse>(
            `${accountBaseUrl}/api/v4/account`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            isAmoAccountResponse,
            'amoCRM account response is invalid',
        );

        return {
            id: body.id,
            subdomain: body.subdomain,
        };
    }

    public async getCustomFields(
        referer: string,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
    ): Promise<AmoCustomFieldResponse[]> {
        const customFields: AmoCustomFieldResponse[] = [];
        let page = 1;
        let pageCount = 1;

        do {
            const body = await this.requestJson<RawAmoCustomFieldListResponse>(
                `${this.buildAccountBaseUrl(referer)}/api/v4/${entityType}/custom_fields`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        page,
                        limit: 250,
                    },
                },
                isRawAmoCustomFieldListResponse,
                'amoCRM custom fields response is invalid',
            );

            customFields.push(...this.mapCustomFieldsResponse(body));

            pageCount =
                typeof body._page_count === 'number' ? body._page_count : page;
            page += 1;
        } while (page <= pageCount);

        return customFields;
    }

    public async createCustomFields(
        referer: string,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
        fields: AmoCustomFieldPayload[],
    ): Promise<AmoCustomFieldResponse[]> {
        const body = await this.requestJson<RawAmoCustomFieldListResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/${entityType}/custom_fields`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: fields,
            },
            isRawAmoCustomFieldListResponse,
            'amoCRM custom fields creation response is invalid',
        );

        return this.mapCustomFieldsResponse(body);
    }

    private buildAccountBaseUrl(referer: string): string {
        const normalizedReferer = referer.startsWith('http')
            ? referer
            : referer.includes('.')
              ? `https://${referer}`
              : `https://${referer}.amocrm.ru`;
        const url = new URL(normalizedReferer);

        return url.origin;
    }

    private mapCustomFieldsResponse(
        body: RawAmoCustomFieldListResponse,
    ): AmoCustomFieldResponse[] {
        const customFields = body._embedded?.custom_fields ?? [];

        return customFields.map((customField) => ({
            id: customField.id,
            name: customField.name,
            type: customField.type,
        }));
    }

    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        isValidResponse: ResponseGuard<TResponse>,
        invalidResponseMessage: string,
    ): Promise<TResponse> {
        let response: AxiosResponse<unknown>;

        try {
            response = await this.httpService.axiosRef.request<unknown>({
                ...config,
                url,
                validateStatus: () => true,
            });
        } catch {
            throw new BadGatewayException('amoCRM API request failed');
        }

        const body = response.data;

        if (
            response.status < 200 ||
            response.status >= 300 ||
            !isValidResponse(body)
        ) {
            throw new BadGatewayException(
                `${invalidResponseMessage}: HTTP ${response.status}`,
            );
        }

        return body;
    }
}
