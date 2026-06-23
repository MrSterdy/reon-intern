import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import type * as Joi from 'joi';
import {
    AmoAccountResponse,
    AmoContactResponse,
    AmoContactUpdatePayload,
    AmoCustomFieldEntityType,
    AmoCustomFieldPayload,
    AmoCustomFieldResponse,
    AmoLeadResponse,
    AmoLeadUpdatePayload,
    AmoTaskPayload,
    AmoTaskResponse,
    AmoTaskUpdatePayload,
    AmoTokenResponse,
    AmoWebhookPayload,
    AmoWebhookResponse,
    RawAmoContactResponse,
    RawAmoCustomFieldListResponse,
    RawAmoLeadResponse,
    RawAmoTaskListResponse,
    RawAmoTaskResponse,
    RawAmoTokenResponse,
    RequestJsonStatus,
    RequestJsonStatusAction,
    RequestJsonStatusActions,
} from './amo-api.types';
import {
    amoAccountResponseSchema,
    amoContactResponseSchema,
    amoCustomFieldListResponseSchema,
    amoLeadResponseSchema,
    amoTaskListResponseSchema,
    amoTaskResponseSchema,
    amoTokenResponseSchema,
    amoWebhookResponseSchema,
} from './amo-api.schemas';
import { validateAmoApiResponse } from './amo-api.validator';
import { ENDPOINTS } from '../../../shared/constants/endpoints';
import { Env } from '../../../shared/enums/env.enum';
import { buildEndpointUrl } from '../../../shared/helpers/url.helpers';

@Injectable()
export class AmoApiService {
    private readonly logger = new Logger(AmoApiService.name);

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
            this.createErrorStatusActions('amoCRM token response is invalid'),
            amoTokenResponseSchema,
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
            this.createErrorStatusActions(
                'amoCRM token refresh response is invalid',
            ),
            amoTokenResponseSchema,
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
            this.createErrorStatusActions('amoCRM account response is invalid'),
            amoAccountResponseSchema,
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
                this.createErrorStatusActions(
                    'amoCRM custom fields response is invalid',
                ),
                amoCustomFieldListResponseSchema,
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
            this.createErrorStatusActions(
                'amoCRM custom fields creation response is invalid',
            ),
            amoCustomFieldListResponseSchema,
        );
        const customFields = this.mapCustomFieldsResponse(body);

        this.logger.log(
            `Created ${customFields.length} amoCRM ${entityType} custom fields for account ${referer}`,
        );

        return customFields;
    }

    public async subscribeWebhook(
        referer: string,
        accessToken: string,
        payload: AmoWebhookPayload,
    ): Promise<AmoWebhookResponse> {
        const webhook = await this.requestJson<AmoWebhookResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/webhooks`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            this.createErrorStatusActions(
                'amoCRM webhook subscription response is invalid',
            ),
            amoWebhookResponseSchema,
        );

        this.logger.log(
            `Subscribed amoCRM webhook ${webhook.id} for account ${referer}: ${payload.settings.join(', ')}`,
        );

        return webhook;
    }

    public async getContact(
        referer: string,
        accessToken: string,
        contactId: string,
    ): Promise<AmoContactResponse | null> {
        const body = await this.requestJson<RawAmoContactResponse | null>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/contacts/${contactId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
            this.createErrorStatusActions<RawAmoContactResponse | null>(
                'amoCRM contact response is invalid',
                new Map([[204, { response: null }]]),
            ),
            amoContactResponseSchema,
        );

        if (body === null) {
            return null;
        }

        return this.mapContactResponse(body);
    }

    public async updateContact(
        referer: string,
        accessToken: string,
        contactId: string,
        payload: AmoContactUpdatePayload,
    ): Promise<void> {
        await this.requestJson<RawAmoContactResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/contacts/${contactId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            this.createErrorStatusActions(
                'amoCRM contact update response is invalid',
            ),
            amoContactResponseSchema,
        );

        this.logger.log(
            `Updated amoCRM contact ${contactId} for account ${referer}`,
        );
    }

    public async getLead(
        referer: string,
        accessToken: string,
        leadId: string,
    ): Promise<AmoLeadResponse | null> {
        const body = await this.requestJson<RawAmoLeadResponse | null>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/leads/${leadId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    with: 'contacts',
                },
            },
            this.createErrorStatusActions<RawAmoLeadResponse | null>(
                'amoCRM lead response is invalid',
                new Map([[204, { response: null }]]),
            ),
            amoLeadResponseSchema,
        );

        if (body === null) {
            return null;
        }

        return this.mapLeadResponse(body);
    }

    public async updateLeadPrice(
        referer: string,
        accessToken: string,
        leadId: string,
        price: number,
    ): Promise<void> {
        const payload: AmoLeadUpdatePayload = { price };

        await this.requestJson<RawAmoLeadResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/leads/${leadId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            this.createErrorStatusActions(
                'amoCRM lead update response is invalid',
            ),
            amoLeadResponseSchema,
        );

        this.logger.log(
            `Updated amoCRM lead ${leadId} price to ${price} for account ${referer}`,
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
            const body = await this.requestJson<RawAmoTaskListResponse>(
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
                this.createErrorStatusActions(
                    'amoCRM tasks response is invalid',
                ),
                amoTaskListResponseSchema,
            );

            tasks.push(...this.mapTasksResponse(body));

            pageCount =
                typeof body._page_count === 'number' ? body._page_count : page;
            page += 1;
        } while (page <= pageCount);

        return tasks;
    }

    public async createTask(
        referer: string,
        accessToken: string,
        payload: AmoTaskPayload,
    ): Promise<void> {
        await this.requestJson<RawAmoTaskListResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/tasks`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: [payload],
            },
            this.createErrorStatusActions(
                'amoCRM task creation response is invalid',
            ),
            amoTaskListResponseSchema,
        );

        this.logger.log(
            `Created amoCRM task for ${payload.entity_type} ${payload.entity_id} in account ${referer}`,
        );
    }

    public async updateTask(
        referer: string,
        accessToken: string,
        taskId: string,
        payload: AmoTaskUpdatePayload,
    ): Promise<void> {
        await this.requestJson<RawAmoTaskResponse>(
            `${this.buildAccountBaseUrl(referer)}/api/v4/tasks/${taskId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                data: payload,
            },
            this.createErrorStatusActions(
                'amoCRM task update response is invalid',
            ),
            amoTaskResponseSchema,
        );

        this.logger.log(`Updated amoCRM task ${taskId} for account ${referer}`);
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

    private mapContactResponse(
        body: RawAmoContactResponse,
    ): AmoContactResponse {
        return {
            id: body.id,
            name: body.name,
            customFields: body.custom_fields_values ?? [],
        };
    }

    private mapLeadResponse(body: RawAmoLeadResponse): AmoLeadResponse {
        return {
            id: body.id,
            price: typeof body.price === 'number' ? body.price : 0,
            customFields: body.custom_fields_values ?? [],
            contacts:
                body._embedded?.contacts?.map((contact) => ({
                    id: contact.id,
                    isMain: contact.is_main === true,
                })) ?? [],
        };
    }

    private mapTasksResponse(body: RawAmoTaskListResponse): AmoTaskResponse[] {
        const tasks = body._embedded?.tasks ?? [];

        return tasks.map((task) => ({
            id: task.id,
            entityId: task.entity_id ?? 0,
            entityType: task.entity_type ?? '',
            isCompleted: task.is_completed === true,
            taskTypeId:
                typeof task.task_type_id === 'number' ? task.task_type_id : 0,
            text: task.text ?? '',
            completeTill:
                typeof task.complete_till === 'number' ? task.complete_till : 0,
        }));
    }

    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        statusActions: RequestJsonStatusActions<TResponse>,
        responseSchema: Joi.ObjectSchema<TResponse>,
    ): Promise<TResponse>;
    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        statusActions: RequestJsonStatusActions<TResponse | null>,
        responseSchema: Joi.ObjectSchema<TResponse>,
    ): Promise<TResponse | null> {
        const response = await this.request({
            ...config,
            url,
            validateStatus: () => true,
        });

        const body = response.data;
        const statusAction = statusActions.get(response.status);

        if (statusAction?.response !== undefined) {
            return statusAction.response;
        }

        if (response.status < 200 || response.status >= 300) {
            const errorMessage =
                statusAction?.errorMessage ??
                statusActions.get('default')?.errorMessage ??
                'amoCRM response is invalid';

            throw new BadGatewayException(
                this.buildInvalidResponseMessage(errorMessage, response),
            );
        }

        const invalidResponseMessage =
            statusActions.get('default')?.errorMessage ??
            'amoCRM response is invalid';

        return validateAmoApiResponse(
            responseSchema,
            body,
            invalidResponseMessage,
            this.buildInvalidResponseMessage(invalidResponseMessage, response),
        );
    }

    private createErrorStatusActions<TResponse>(
        errorMessage: string,
        statusActions: ReadonlyMap<
            number,
            RequestJsonStatusAction<TResponse>
        > = new Map(),
    ): RequestJsonStatusActions<TResponse> {
        const actions = new Map<
            RequestJsonStatus,
            RequestJsonStatusAction<TResponse>
        >(statusActions);

        actions.set('default', { errorMessage });

        return actions;
    }

    private async request(
        config: AxiosRequestConfig,
    ): Promise<AxiosResponse<unknown>> {
        try {
            return await this.httpService.axiosRef.request<unknown>(config);
        } catch {
            throw new BadGatewayException(
                `amoCRM API request failed: ${this.formatRequest(config)}`,
            );
        }
    }

    private buildInvalidResponseMessage(
        invalidResponseMessage: string,
        response: AxiosResponse<unknown>,
    ): string {
        return `${invalidResponseMessage}: ${this.formatRequest(response.config)} HTTP ${response.status}${this.formatResponseBody(response.data)}`;
    }

    private formatRequest(config: AxiosRequestConfig): string {
        const method = config.method?.toUpperCase() ?? 'GET';
        const url = config.url ?? 'unknown URL';

        return `${method} ${url}`;
    }

    private formatResponseBody(body: unknown): string {
        if (body === undefined) {
            return '';
        }

        try {
            const serializedBody = JSON.stringify(body);

            if (serializedBody === undefined) {
                return '';
            }

            return ` body=${serializedBody.slice(0, 500)}`;
        } catch {
            return '';
        }
    }
}
