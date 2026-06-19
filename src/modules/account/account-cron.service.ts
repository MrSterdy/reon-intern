import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AccountService } from './account.service';
import { EVERY_TWELVE_HOURS_CRON } from '../../shared/consts/cron';

@Injectable()
export class AccountCronService {
    public constructor(private readonly accountService: AccountService) {}

    @Cron(EVERY_TWELVE_HOURS_CRON)
    public async refreshInstalledAccountTokens(): Promise<void> {
        await this.accountService.refreshInstalledAccountTokens();
    }
}
