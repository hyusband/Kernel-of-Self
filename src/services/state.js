const { sql } = require('@vercel/postgres');
require('dotenv').config();

const { encrypt } = require('../utils/crypto');
const { generateEmbedding } = require('./oracle');

async function setMood(score, note = null) {
    try {
        const encryptedNote = note ? encrypt(note) : null;

        // Generate embedding for "public" notes (not encrypted ones, or decrypt first?)
        // If note is encrypted client-side (Vault), we can't embed it server-side.
        // For standard logs (plaintext note), we embed it.
        let embedding = null;
        if (note && !note.startsWith('{"iv":')) {
            try {
                const vector = await generateEmbedding(`Mood: ${score}. Note: ${note}`);
                embedding = JSON.stringify(vector);
            } catch (e) {
                console.error('Embedding generation failed:', e);
            }
        }

        const result = await sql`
            INSERT INTO moods (score, note, embedding) 
            VALUES (${score}, ${encryptedNote}, ${embedding})
        `;
        console.log(`[DB] Mood set to ${score}. Encrypted note saved. Embedding generated: ${!!embedding}`);
        return result;
    } catch (error) {
        console.error('[DB] Error setting mood:', error);
        // Fallback or re-throw depending on desired behavior
        // For now, we log and proceed (API shouldn't crash if DB is down, maybe?)
        // But better to fail so user knows. // Bueno ahora si falla no crashea
        throw error;
    }
}

async function getMood() {
    try {
        const { rows } = await sql`
            SELECT * FROM moods 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        if (rows.length > 0) {
            return rows[0];
        }

        return { score: null };
    } catch (error) {
        console.error('[DB] Error getting mood:', error);
        return { score: null };
    }
}

// Ahora registro si dormi bien ( no lo registrare llevo sin dormir bien 2 meses )

async function logSleep(duration, quality) {
    try {
        const result = await sql`
            INSERT INTO sleep_logs (duration, quality) 
            VALUES (${duration}, ${quality})
        `;
        console.log(`[DB] Sleep logged: ${duration}h / Quality: ${quality}`);
        return result;
    } catch (error) {
        console.error('[DB] Error logging sleep:', error);
        throw error;
    }
}

async function getLatestSleep() {
    try {
        const { rows } = await sql`
            SELECT * FROM sleep_logs 
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    } catch (error) {
        console.error('[DB] Error getting sleep:', error);
        return null;
    }
}

module.exports = { setMood, getMood, logSleep, getLatestSleep };
