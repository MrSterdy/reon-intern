import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '../config/config.module';
import { createTypeOrmOptions } from '../config/typeorm.config';

@Module({
    imports: [
        AppConfigModule,
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: createTypeOrmOptions,
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
