import { createHmac } from 'node:crypto';
import { isEqualSignature } from '../../../shared/helpers/signature.helper';

const AMO_UNINSTALL_SIGNATURE_ALGORITHM = 'sha256';

type AmoUninstallHookSignaturePayload = {
    accountId: string;
    clientId: string;
    clientSecret: string;
    signature: string;
};

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
