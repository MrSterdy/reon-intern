import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
} from 'crypto';
import { ValueTransformer } from 'typeorm';
import { Env } from '../enums/env.enum';

const ALGORITHM = 'aes-256-gcm';
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_IV_LENGTH = 12;
const ENCRYPTED_VALUE_PARTS_COUNT = 3;
const ENCRYPTED_VALUE_SEPARATOR = ':';

function getEncryptionKey(): Buffer {
    const encryptionKey = process.env[Env.EncryptionKey];

    if (!encryptionKey) {
        throw new Error(`${Env.EncryptionKey} is required to encrypt columns`);
    }

    return createHash('sha256').update(encryptionKey).digest();
}

export const encryptedColumnTransformer: ValueTransformer = {
    to(value: string | null): string | null {
        if (value === null) {
            return null;
        }

        const iv = randomBytes(ENCRYPTION_IV_LENGTH);
        const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv, {
            authTagLength: AUTH_TAG_LENGTH,
        });
        const encryptedValue = Buffer.concat([
            cipher.update(value, 'utf8'),
            cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        return [
            iv.toString('base64'),
            authTag.toString('base64'),
            encryptedValue.toString('base64'),
        ].join(ENCRYPTED_VALUE_SEPARATOR);
    },

    from(value: string | null): string | null {
        if (value === null) {
            return null;
        }

        const encryptedValueParts = value.split(ENCRYPTED_VALUE_SEPARATOR);

        if (encryptedValueParts.length !== ENCRYPTED_VALUE_PARTS_COUNT) {
            throw new Error('Encrypted column value has invalid format');
        }

        const [iv, authTag, encryptedValue] = encryptedValueParts.map(
            (part: string): Buffer => Buffer.from(part, 'base64'),
        );
        const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv, {
            authTagLength: AUTH_TAG_LENGTH,
        });
        decipher.setAuthTag(authTag);

        return Buffer.concat([
            decipher.update(encryptedValue),
            decipher.final(),
        ]).toString('utf8');
    },
};
