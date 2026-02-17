const { sql } = require('@vercel/postgres');
const { decrypt } = require('../src/utils/crypto');
const axios = require('axios');
require('dotenv').config();

// Ensure server is running for this test, or we replicate the insertion logic.
// Testing the full flow (API -> DB) is better.

async function verify() {
    console.log('🧪 Starting Encryption Verification...');

    const secretNote = `Secret thought at ${Date.now()}`;
    const score = 8;

    try {
        const { setMood } = require('../src/services/state');
        console.log(`1. Inserting mood with note: "${secretNote}"`);
        await setMood(score, secretNote);

        console.log('2. Querying database for latest entry...');
        const { rows } = await sql`SELECT * FROM moods ORDER BY created_at DESC LIMIT 1`;
        const entry = rows[0];

        if (!entry) throw new Error('No entry found in DB');

        console.log('   DB Entry:', entry);

        if (entry.note === secretNote) {
            console.error('❌ FAILURE: Note is stored in PLAIN TEXT!');
            process.exit(1);
        } else {
            console.log('✅ SUCCESS: Note is NOT plain text in DB.');
        }

        console.log('3. Attempting to decrypt...');
        const decrypted = decrypt(entry.note);

        if (decrypted === secretNote) {
            console.log(`✅ SUCCESS: Decrypted note matches original: "${decrypted}"`);
        } else {
            console.error(`❌ FAILURE: Decrypted note does NOT match. Got: "${decrypted}"`);
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

verify();
