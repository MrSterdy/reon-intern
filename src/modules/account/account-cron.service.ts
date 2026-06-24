import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountService } from './account.service';

@Injectable()
export class AccountCronService {
    public constructor(private readonly accountService: AccountService) {}

    @Cron(CronExpression.EVERY_12_HOURS)
    public async refreshInstalledAccountTokens(): Promise<void> {
        await this.accountService.refreshInstalledAccountTokens();
    }
}
