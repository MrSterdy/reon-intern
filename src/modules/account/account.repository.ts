import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { AccountEntity } from './account.entity';

type InstallAccountPayload = {
    accountId: string;
    subdomain: string;
    accessToken: string;
    refreshToken: string;
};

@Injectable()
export class AccountRepository {
    public constructor(
        @InjectRepository(AccountEntity)
        private readonly repository: Repository<AccountEntity>,
    ) {}

    public async findByAccountId(
        accountId: string,
    ): Promise<AccountEntity | null> {
        return this.repository.findOne({ where: { accountId } });
    }

    public async saveInstalledAccount(
        payload: InstallAccountPayload,
    ): Promise<AccountEntity> {
        const account =
            (await this.findByAccountId(payload.accountId)) ??
            this.repository.create({ accountId: payload.accountId });

        account.subdomain = payload.subdomain;
        account.accessToken = payload.accessToken;
        account.refreshToken = payload.refreshToken;
        account.isInstalled = true;

        return this.repository.save(account);
    }

    public async markUninstalled(accountId: string): Promise<UpdateResult> {
        return this.repository.update(
            { accountId },
            {
                accessToken: null,
                refreshToken: null,
                isInstalled: false,
            },
        );
    }
}
