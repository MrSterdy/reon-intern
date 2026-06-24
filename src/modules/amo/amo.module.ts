import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AmoOauthController } from './amo-oauth.controller';
import { AmoOauthService } from './amo-oauth.service';

@Module({
    imports: [AccountModule],
    controllers: [AmoOauthController],
    providers: [AmoOauthService],
})
export class AmoModule {}
