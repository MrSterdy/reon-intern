import { registerAs } from '@nestjs/config';
import { Env } from '../shared/enums/env.enum';

export const databaseConfig = registerAs('database', () => ({
  host: process.env[Env.PostgresHost],
  port: Number(process.env[Env.PostgresPort]),
  username: process.env[Env.PostgresUsername],
  password: process.env[Env.PostgresPassword],
  database: process.env[Env.PostgresDatabase],
}));
