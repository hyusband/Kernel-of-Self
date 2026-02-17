const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY;
// Ahora todo deberia ser mas seguro
if (!KEY_HEX || KEY_HEX.length !== 64) {
    console.warn('[Crypto] Warning: ENCRYPTION_KEY is missing or invalid (must be 64 hex chars). Encryption will fail.');
}

function encrypt(text) {
    if (!text) return null;
    if (!KEY_HEX) throw new Error('Encryption key not configured');

    const key = Buffer.from(KEY_HEX, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(text) {
    if (!text) return null;
    if (!KEY_HEX) throw new Error('Encryption key not configured');

    const parts = text.split(':');
    if (parts.length !== 3) {
        // Maybe it's legacy unencrypted text? Return as is or throw.
        // For mixed content during migration, returning as is might be safer, 
        // but for strict security, we should fail. Let's return as is for robustness during dev.
        return text;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = Buffer.from(KEY_HEX, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt };
