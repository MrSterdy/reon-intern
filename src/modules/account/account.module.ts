import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from '../api/api.module';
import { CustomFieldModule } from '../custom-field/custom-field.module';
import { WebhookModule } from '../webhook/webhook.module';
import { AccountEntity } from './account.entity';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';
import { AccountCronService } from './account-cron.service';

@Module({
    imports: [
        ApiModule,
        CustomFieldModule,
        WebhookModule,
        TypeOrmModule.forFeature([AccountEntity]),
    ],
    providers: [AccountRepository, AccountService, AccountCronService],
    exports: [AccountRepository, AccountService],
})
export class AccountModule {}
