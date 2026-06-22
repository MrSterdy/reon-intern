import { createHmac } from 'node:crypto';
import { isEqualSignature } from '../../shared/helpers/crypto.helpers';
import { AmoUninstallHookSignaturePayload } from './amo.types';

const AMO_UNINSTALL_SIGNATURE_ALGORITHM = 'sha256';

export function isValidAmoUninstallHookSignature(
    payload: AmoUninstallHookSignaturePayload,
): boolean {
    const expectedSignature = createHmac(
        AMO_UNINSTALL_SIGNATURE_ALGORITHM,
        payload.clientSecret,
    )
        .update(`${payload.clientId}|${payload.accountId}`)
        .digest('hex');

    return isEqualSignature(expectedSignature, payload.signature);
}
