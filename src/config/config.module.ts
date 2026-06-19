import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { amoConfig } from './amo.config';
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
            load: [appConfig, databaseConfig, amoConfig],
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
