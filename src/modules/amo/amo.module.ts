import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AmoOauthController } from './amo-oauth.controller';

@Module({
    imports: [AccountModule],
    controllers: [AmoOauthController],
})
export class AmoModule {}
