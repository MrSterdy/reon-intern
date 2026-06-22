import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ApiModule } from '../api/api.module';
import { ContactModule } from '../contact/contact.module';
import { CustomFieldModule } from '../custom-field/custom-field.module';
import { LeadPriceCalculatorService } from './lead-price-calculator.service';
import { LeadTaskService } from './lead-task.service';
import { LeadWebhookController } from './lead-webhook.controller';
import { LeadWebhookService } from './lead-webhook.service';
import { LeadService } from './lead.service';

@Module({
    imports: [AccountModule, ApiModule, ContactModule, CustomFieldModule],
    controllers: [LeadWebhookController],
    providers: [
        LeadService,
        LeadWebhookService,
        LeadPriceCalculatorService,
        LeadTaskService,
    ],
})
export class LeadModule {}
