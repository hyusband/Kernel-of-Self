const { sql } = require('@vercel/postgres');
require('dotenv').config();

const { encrypt, decrypt } = require('../utils/crypto');
const { generateEmbedding } = require('./oracle');

/*
La ia hizo mal su propia function
volvio a romper su propia funcion
*/

async function setMood(score, note = null, isEncrypted = false, userId, iv = null, salt = null) {
    try {
        let finalNote = note;
        if (!isEncrypted && note) {
            finalNote = encrypt(note);
        }

        let embedding = null;
        if (note && !isEncrypted) {
            try {
                const vector = await generateEmbedding(`Mood: ${score}. Note: ${note}`);
                embedding = JSON.stringify(vector);
            } catch (e) {
                console.error('Embedding generation failed:', e);
            }
        }

        const result = await sql`
            INSERT INTO moods (score, note, embedding, user_id, is_vault, iv, salt) 
            VALUES (${score}, ${finalNote}, ${embedding}, ${userId}, ${isEncrypted}, ${iv}, ${salt})
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

async function getMood(userId) {
    try {
        const { rows } = await sql`
            SELECT * FROM moods 
            WHERE user_id = ${userId}
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

async function logSleep(duration, quality, userId) {
    try {
        const result = await sql`
            INSERT INTO sleep_logs (duration, quality, user_id) 
            VALUES (${duration}, ${quality}, ${userId})
        `;
        console.log(`[DB] Sleep logged: ${duration}h / Quality: ${quality}`);
        return result;
    } catch (error) {
        console.error('[DB] Error logging sleep:', error);
        throw error;
    }
}

async function getLatestSleep(userId) {
    try {
        const { rows } = await sql`
            SELECT * FROM sleep_logs 
            WHERE user_id = ${userId}
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

/*
La idea de un diario, surge de un comentario que me hicieron
igualmente tu no quieres a ninguna 
*/

async function getHistory(userId) {
    try {
        const { rows } = await sql`
            SELECT * FROM moods 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC 
            LIMIT 50
        `;

        return rows.map(row => {
            if (row.note && !row.is_vault) {
                try {
                    return { ...row, note: decrypt(row.note) };
                } catch (e) {
                    console.error(`Failed to decrypt log ${row.id}`, e);
                    return { ...row, note: "[Decryption Failed]" };
                }
            }
            return row;
        });

    } catch (error) {
        console.error('[DB] Error getting history:', error);
        return [];
    }
}

async function getSleepHistory(userId) {
    try {
        const { rows } = await sql`
            SELECT * FROM sleep_logs 
            WHERE user_id = ${userId}
            ORDER BY created_at ASC 
            LIMIT 30
        `;
        return rows;
    } catch (error) {
        console.error('[DB] Error getting sleep history:', error);
        return [];
    }
}

module.exports = { setMood, getMood, logSleep, getLatestSleep, getHistory, getSleepHistory };
