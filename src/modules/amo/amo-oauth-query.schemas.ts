import * as Joi from 'joi';
import { AmoOauthInstallQuery, AmoOauthUninstallQuery } from './amo.types';

export const amoOauthInstallQuerySchema = Joi.object<AmoOauthInstallQuery>({
    code: Joi.string().max(1024).required(),
    referer: Joi.string().max(255).required(),
    state: Joi.string().max(1024).optional(),
    from_widget: Joi.string().max(32).optional(),
    platform: Joi.number().integer().optional(),
    redirectUri: Joi.string().uri().max(2048).optional(),
});

export const amoOauthUninstallQuerySchema = Joi.object<AmoOauthUninstallQuery>({
    account_id: Joi.string().max(64).required(),
    client_uuid: Joi.string().max(255).required(),
    signature: Joi.string().max(255).required(),
});
