import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';
import { Env } from '../shared/enums/env.enum';

export function createTypeOrmOptions(
    configService: ConfigService,
): TypeOrmModuleOptions {
    return {
        type: 'postgres',
        host: configService.getOrThrow<string>(Env.PostgresHost),
        port: configService.getOrThrow<number>(Env.PostgresPort),
        username: configService.getOrThrow<string>(Env.PostgresUsername),
        password: configService.getOrThrow<string>(Env.PostgresPassword),
        database: configService.getOrThrow<string>(Env.PostgresDatabase),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [
            join(__dirname, '..', 'generated', 'migrations', '*{.ts,.js}'),
        ],
        migrationsRun: false,
    };
}
