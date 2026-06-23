import { BadRequestException } from '@nestjs/common';
import {
    AmoOauthInstallCommand,
    AmoOauthUninstallCommand,
} from '../account/account.types';
import { validateJoiSchema } from '../../shared/helpers/joi.helpers';
import {
    amoOauthInstallQuerySchema,
    amoOauthUninstallQuerySchema,
} from './amo-oauth.schemas';

export function validateAmoOauthInstallQuery(
    query: Record<string, unknown>,
): AmoOauthInstallCommand {
    try {
        const value = validateJoiSchema(amoOauthInstallQuerySchema, query, {
            abortEarly: false,
            convert: true,
            stripUnknown: true,
        });

        return {
            code: value.code,
            referer: value.referer,
            state: value.state,
            fromWidget: value.from_widget,
            platform: value.platform,
            redirectUri: value.redirectUri,
        };
    } catch {
        throw new BadRequestException('Invalid amoCRM install query');
    }
}

export function validateAmoOauthUninstallQuery(
    query: Record<string, unknown>,
): AmoOauthUninstallCommand {
    try {
        const value = validateJoiSchema(amoOauthUninstallQuerySchema, query, {
            abortEarly: false,
            convert: true,
            stripUnknown: true,
        });

        return {
            accountId: value.account_id,
            clientUuid: value.client_uuid,
            signature: value.signature,
        };
    } catch {
        throw new BadRequestException('Invalid amoCRM uninstall query');
    }
}
