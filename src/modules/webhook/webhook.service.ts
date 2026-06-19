import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountEntity } from '../account/account.entity';
import { AmoApiService } from '../api/amo-api/amo-api.service';
import { REQUIRED_WEBHOOK_SUBSCRIPTIONS } from './webhook.consts';

@Injectable()
export class WebhookService {
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

        for (const subscription of REQUIRED_WEBHOOK_SUBSCRIPTIONS) {
            await this.amoApiService.subscribeWebhook(
                account.subdomain,
                account.accessToken,
                {
                    destination: this.configService.getOrThrow<string>(
                        subscription.configKey,
                    ),
                    settings: [subscription.event],
                },
            );
        }
    }
}
