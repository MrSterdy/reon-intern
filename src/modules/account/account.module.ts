import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from '../api/api.module';
import { AccountEntity } from './account.entity';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
    imports: [ApiModule, TypeOrmModule.forFeature([AccountEntity])],
    providers: [AccountRepository, AccountService],
    exports: [AccountRepository, AccountService],
})
export class AccountModule {}
