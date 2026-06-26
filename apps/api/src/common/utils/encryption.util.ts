import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('SETTINGS_ENCRYPTION_KEY is required');
  }

  const key = Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error('SETTINGS_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }

  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

export function tryDecryptSecret(ciphertext: string | null | undefined): string | null {
  if (!ciphertext) {
    return null;
  }

  try {
    return decryptSecret(ciphertext);
  } catch {
    return null;
  }
}

export function isEncryptionKeyConfigured(): boolean {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.length <= 4) {
    return '••••';
  }

  return `••••${value.slice(-4)}`;
}
