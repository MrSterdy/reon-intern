import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '../config/config.module';
import { createTypeOrmOptions } from '../config/typeorm.config';
import { AccountModule } from '../modules/account/account.module';
import { AmoModule } from '../modules/amo/amo.module';
import { ContactModule } from '../modules/contact/contact.module';
import { LeadModule } from '../modules/lead/lead.module';

@Module({
    imports: [
        AppConfigModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: createTypeOrmOptions,
        }),
        AccountModule,
        AmoModule,
        ContactModule,
        LeadModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
