import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { Env } from './shared/enums/env.enum';
import { validateConfig } from './config/config.schema';

config();

const env = validateConfig(process.env);

export default new DataSource({
    type: 'postgres',
    host: env[Env.PostgresHost],
    port: env[Env.PostgresPort],
    username: env[Env.PostgresUsername],
    password: env[Env.PostgresPassword],
    database: env[Env.PostgresDatabase],
    entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
    synchronize: false,
});
