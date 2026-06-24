import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountEntity } from '../account/account.entity';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { Env } from '../../shared/enums/env.enum';
import { buildEndpointUrl } from '../../shared/helpers/url.helpers';
import { REQUIRED_WEBHOOK_SUBSCRIPTIONS } from './webhook.consts';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    public constructor(
        private readonly amoApiService: AmoApiService,
        private readonly configService: ConfigService,
    ) {}

    public async syncForAccount(account: AccountEntity): Promise<void> {
        if (account.accessToken === null) {
            throw new BadGatewayException(
                'amoCRM account access token is missing',
            );
        }

        const webhooks = await this.amoApiService.getWebhooks(
            account.subdomain,
            account.accessToken,
        );

        for (const subscription of REQUIRED_WEBHOOK_SUBSCRIPTIONS) {
            const destination = buildEndpointUrl(
                this.configService.getOrThrow<string>(
                    Env.AmoIntegrationBaseUrl,
                ),
                ...subscription.endpointSegments,
            );
            const destinationWebhooks = webhooks.filter(
                (webhook) => webhook.destination === destination,
            );
            const existingWebhook = destinationWebhooks.find((webhook) =>
                webhook.settings.includes(subscription.event),
            );

            if (existingWebhook?.disabled === true) {
                this.logger.error(
                    `amoCRM webhook is disabled and must be enabled manually: account ${account.accountId}, destination ${destination}, event ${subscription.event}`,
                );
                continue;
            }

            if (existingWebhook !== undefined) {
                continue;
            }

            await this.amoApiService.subscribeWebhook(
                account.subdomain,
                account.accessToken,
                {
                    destination,
                    settings: [subscription.event],
                },
            );
        }
    }
}
