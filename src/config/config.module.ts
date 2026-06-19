import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { configurationValidationSchema } from './config.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [
                `.env.${process.env.NODE_ENV}.local`,
                `.env.${process.env.NODE_ENV}`,
                '.env.local',
                '.env',
            ],
            load: [appConfig, databaseConfig],
            validationSchema: configurationValidationSchema,
            validationOptions: {
                abortEarly: true,
                allowUnknown: true,
            },
        }),
    ],
    exports: [ConfigModule],
})
export class AppConfigModule {}
