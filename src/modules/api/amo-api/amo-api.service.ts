import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
    AmoAccountResponse,
    AmoApiResponseValidator,
    AmoContactResponse,
    AmoContactUpdatePayload,
    AmoCustomFieldEntityType,
    AmoCustomFieldListResponse,
    AmoCustomFieldPayload,
    AmoCustomFieldResponse,
    AmoLeadResponse,
    AmoLeadUpdatePayload,
    AmoTaskPayload,
    AmoTaskResponse,
    AmoTaskUpdatePayload,
    AmoTokenResponse,
    AmoWebhookListResponse,
    AmoWebhookPayload,
    AmoWebhookResponse,
    RequestJsonStatusActions,
} from './amo-api.types';
import {
    validateAmoAccountResponse,
    validateAmoContactResponse,
    validateAmoCustomFieldListResponse,
    validateAmoLeadResponse,
    validateAmoTaskListResponse,
    validateAmoTaskResponse,
    validateAmoTokenResponse,
    validateAmoWebhookListResponse,
    validateAmoWebhookResponse,
} from './amo-api.validator';
import { ENDPOINTS } from '../../../shared/constants/endpoints';
import { Env } from '../../../shared/enums/env.enum';
import { buildEndpointUrl } from '../../../shared/helpers/url.helpers';
import { AMO_CUSTOM_FIELDS_PAGE_BATCH_SIZE } from './amo-api.consts';

@Injectable()
export class AmoApiService {
    private readonly logger = new Logger(AmoApiService.name);

    public constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    public exchangeAuthorizationCode(
        referer: string,
        code: string,
        redirectUri?: string,
    ): Promise<AmoTokenResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);

        return this.requestJson<AmoTokenResponse>(
            `${accountBaseUrl}/oauth2/access_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    client_id: this.configService.getOrThrow<string>(
                        Env.AmoClientId,
                    ),
                    client_secret: this.configService.getOrThrow<string>(
                        Env.AmoClientSecret,
                    ),
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: redirectUri ?? this.buildRedirectUri(),
                },
            },
            {
                default: { errorMessage: 'amoCRM token response is invalid' },
            },
            validateAmoTokenResponse,
        );
    }

    public refreshAccessToken(
        referer: string,
        refreshToken: string,
    ): Promise<AmoTokenResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);

        return this.requestJson<AmoTokenResponse>(
            `${accountBaseUrl}/oauth2/access_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    client_id: this.configService.getOrThrow<string>(
                        Env.AmoClientId,
                    ),
                    client_secret: this.configService.getOrThrow<string>(
                        Env.AmoClientSecret,
                    ),
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    redirect_uri: this.buildRedirectUri(),
                },
            },
            {
                default: {
                    errorMessage: 'amoCRM token refresh response is invalid',
                },
            },
            validateAmoTokenResponse,
        );
    }

    public getAccount(
        referer: string,
        accessToken: string,
    ): Promise<AmoAccountResponse> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);

        return this.requestJson<AmoAccountResponse>(
            `${accountBaseUrl}/api/v4/account`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            {
                default: { errorMessage: 'amoCRM account response is invalid' },
            },
            validateAmoAccountResponse,
        );
    }

    public async getCustomFields(
        referer: string,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
    ): Promise<AmoCustomFieldResponse[]> {
        const accountBaseUrl = this.buildAccountBaseUrl(referer);
        const firstPage = await this.requestCustomFieldsPage(
            accountBaseUrl,
            accessToken,
            entityType,
            1,
        );
        const customFields = [...firstPage.customFields];
        const pageCount = firstPage.pageCount ?? 1;

        for (
            let page = 2;
            page <= pageCount;
            page += AMO_CUSTOM_FIELDS_PAGE_BATCH_SIZE
        ) {
            const pages = Array.from(
                {
                    length: Math.min(
                        AMO_CUSTOM_FIELDS_PAGE_BATCH_SIZE,
                        pageCount - page + 1,
                    ),
                },
                (_, index) => page + index,
            );
            const responses = await Promise.all(
                pages.map((pageNumber) =>
                    this.requestCustomFieldsPage(
                        accountBaseUrl,
                        accessToken,
                        entityType,
                        pageNumber,
                    ),
                ),
            );

            customFields.push(
                ...responses.flatMap((response) => response.customFields),
            );
        }

        return customFields;
    }

    public async createCustomFields(
        referer: string,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
        fields: AmoCustomFieldPayload[],
    ): Promise<AmoCustomFieldResponse[]> {
        const body = await this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/${entityType}/custom_fields`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: fields,
            },
            {
                default: {
                    errorMessage:
                        'amoCRM custom fields creation response is invalid',
                },
            },
            validateAmoCustomFieldListResponse,
        );

        return body.customFields;
    }

    public subscribeWebhook(
        referer: string,
        accessToken: string,
        payload: AmoWebhookPayload,
    ): Promise<AmoWebhookResponse> {
        return this.requestJson<AmoWebhookResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/webhooks`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            {
                default: {
                    errorMessage:
                        'amoCRM webhook subscription response is invalid',
                },
            },
            validateAmoWebhookResponse,
        );
    }

    public async getWebhooks(
        referer: string,
        accessToken: string,
        destination?: string,
    ): Promise<AmoWebhookResponse[]> {
        const body = await this.requestJson<AmoWebhookListResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/webhooks`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params:
                    destination === undefined
                        ? undefined
                        : {
                              'filter[destination]': destination,
                          },
            },
            {
                default: {
                    errorMessage: 'amoCRM webhooks response is invalid',
                },
            },
            validateAmoWebhookListResponse,
        );

        return body.webhooks;
    }

    public getContact(
        referer: string,
        accessToken: string,
        contactId: string,
    ): Promise<AmoContactResponse | null> {
        return this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/contacts/${contactId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            {
                204: { response: null },
                default: { errorMessage: 'amoCRM contact response is invalid' },
            },
            validateAmoContactResponse,
        );
    }

    public async updateContact(
        referer: string,
        accessToken: string,
        contactId: string,
        payload: AmoContactUpdatePayload,
    ): Promise<void> {
        await this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/contacts/${contactId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            {
                default: {
                    errorMessage: 'amoCRM contact update response is invalid',
                },
            },
            validateAmoContactResponse,
        );
    }

    public getLead(
        referer: string,
        accessToken: string,
        leadId: string,
    ): Promise<AmoLeadResponse | null> {
        return this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/leads/${leadId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    with: 'contacts',
                },
            },
            {
                204: { response: null },
                default: { errorMessage: 'amoCRM lead response is invalid' },
            },
            validateAmoLeadResponse,
        );
    }

    public async updateLeadPrice(
        referer: string,
        accessToken: string,
        leadId: string,
        price: number,
    ): Promise<void> {
        const payload: AmoLeadUpdatePayload = { price };

        await this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/leads/${leadId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            {
                default: {
                    errorMessage: 'amoCRM lead update response is invalid',
                },
            },
            validateAmoLeadResponse,
        );
    }

    public async getLeadTasks(
        referer: string,
        accessToken: string,
        leadId: string,
        taskTypeId: number,
    ): Promise<AmoTaskResponse[]> {
        const tasks: AmoTaskResponse[] = [];
        let page = 1;
        let pageCount = 1;

        do {
            const body = await this.requestJson(
                `${this.buildAccountBaseUrl(referer)}/api/v4/tasks`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        page,
                        limit: 250,
                        'filter[entity_type]': 'leads',
                        'filter[entity_id]': leadId,
                        'filter[is_completed]': 0,
                        'filter[task_type]': taskTypeId,
                    },
                },
                {
                    default: {
                        errorMessage: 'amoCRM tasks response is invalid',
                    },
                },
                validateAmoTaskListResponse,
            );

            tasks.push(...body.tasks);

            pageCount = body.pageCount ?? page;
            page += 1;
        } while (page <= pageCount);

        return tasks;
    }

    public async createTask(
        referer: string,
        accessToken: string,
        payload: AmoTaskPayload,
    ): Promise<void> {
        await this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/tasks`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: [payload],
            },
            {
                default: {
                    errorMessage: 'amoCRM task creation response is invalid',
                },
            },
            validateAmoTaskListResponse,
        );
    }

    public async updateTask(
        referer: string,
        accessToken: string,
        taskId: string,
        payload: AmoTaskUpdatePayload,
    ): Promise<void> {
        await this.requestJson(
            `${this.buildAccountBaseUrl(referer)}/api/v4/tasks/${taskId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            {
                default: {
                    errorMessage: 'amoCRM task update response is invalid',
                },
            },
            validateAmoTaskResponse,
        );
    }

    private buildAccountBaseUrl(referer: string): string {
        const normalizedReferer = referer.startsWith('http')
            ? referer
            : referer.includes('.amocrm.ru')
              ? `https://${referer}`
              : `https://${referer}.amocrm.ru`;
        const url = new URL(normalizedReferer);

        return url.origin;
    }

    private buildRedirectUri(): string {
        return buildEndpointUrl(
            this.configService.getOrThrow<string>(Env.AmoIntegrationBaseUrl),
            ENDPOINTS.amo.oauth.base,
            ENDPOINTS.amo.oauth.install,
        );
    }

    private requestCustomFieldsPage(
        accountBaseUrl: string,
        accessToken: string,
        entityType: AmoCustomFieldEntityType,
        page: number,
    ): Promise<AmoCustomFieldListResponse> {
        return this.requestJson(
            `${accountBaseUrl}/api/v4/${entityType}/custom_fields`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    page,
                    limit: 250,
                },
            },
            {
                default: {
                    errorMessage: 'amoCRM custom fields response is invalid',
                },
            },
            validateAmoCustomFieldListResponse,
        );
    }

    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        statusActions: RequestJsonStatusActions<TResponse>,
        responseValidator: AmoApiResponseValidator<TResponse>,
    ): Promise<TResponse>;
    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        statusActions: RequestJsonStatusActions<TResponse | null>,
        responseValidator: AmoApiResponseValidator<TResponse>,
    ): Promise<TResponse | null> {
        let response: AxiosResponse<unknown>;

        try {
            response = await this.httpService.axiosRef.request<unknown>({
                ...config,
                url,
                validateStatus: () => true,
            });
        } catch (error: unknown) {
            this.logger.error(
                'amoCRM API request failed',
                error instanceof Error ? error.stack : undefined,
            );
            throw new BadGatewayException('amoCRM API request failed');
        }

        const body = response.data;
        const statusAction = statusActions[response.status];

        if (statusAction?.response !== undefined) {
            return statusAction.response;
        }

        if (response.status < 200 || response.status >= 300) {
            const errorMessage =
                statusAction?.errorMessage ??
                statusActions.default.errorMessage ??
                'amoCRM response is invalid';

            this.logger.error(
                `${errorMessage}: HTTP ${response.status} ${url}`,
            );

            throw new BadGatewayException(errorMessage);
        }

        return responseValidator(body, 'Invalid amoCRM response');
    }
}
