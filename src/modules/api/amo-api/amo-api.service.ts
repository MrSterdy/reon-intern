import { BadGatewayException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
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
import { ENDPOINTS } from '../../../shared/constants/endpoints';
import { Env } from '../../../shared/enums/env.enum';
import { buildEndpointUrl } from '../../../shared/helpers/url.helpers';

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
        );

        return this.mapCustomFieldsResponse(body);
    }

    public async subscribeWebhook(
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
            this.createErrorStatusActions(
                'amoCRM webhook subscription response is invalid',
            ),
        );
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
        await this.requestJson<unknown>(
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

        await this.requestJson<unknown>(
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
    ): Promise<TResponse>;
    private async requestJson<TResponse>(
        url: string,
        config: AxiosRequestConfig,
        statusActions: RequestJsonStatusActions<TResponse | null>,
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

        return body as TResponse;
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
