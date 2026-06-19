import { registerAs } from '@nestjs/config';
import { Env } from '../shared/enums/env.enum';

export const appConfig = registerAs('app', () => ({
    port: Number(process.env[Env.AppPort]),
    nodeEnv: process.env[Env.NodeEnv],
}));
