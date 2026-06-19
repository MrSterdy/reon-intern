import { Module } from '@nestjs/common';
import { ApiModule } from '../api/api.module';
import { WebhookService } from './webhook.service';

@Module({
    imports: [ApiModule],
    providers: [WebhookService],
    exports: [WebhookService],
})
export class WebhookModule {}
