import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ApiModule } from '../api/api.module';
import { CustomFieldModule } from '../custom-field/custom-field.module';
import { ContactWebhookController } from './contact-webhook.controller';
import { ContactWebhookService } from './contact-webhook.service';
import { ContactService } from './contact.service';

@Module({
    imports: [AccountModule, ApiModule, CustomFieldModule],
    controllers: [ContactWebhookController],
    providers: [ContactService, ContactWebhookService],
    exports: [ContactService],
})
export class ContactModule {}
