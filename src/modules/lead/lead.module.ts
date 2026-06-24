import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ApiModule } from '../api/api.module';
import { ContactModule } from '../contact/contact.module';
import { CustomFieldModule } from '../custom-field/custom-field.module';
import { LeadWebhookController } from './lead-webhook.controller';
import { LeadWebhookService } from './lead-webhook.service';
import { LeadService } from './lead.service';

@Module({
    imports: [AccountModule, ApiModule, ContactModule, CustomFieldModule],
    controllers: [LeadWebhookController],
    providers: [LeadService, LeadWebhookService],
})
export class LeadModule {}
