const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function setMood(score) {
    try {
        const result = await sql`
            INSERT INTO moods (score) 
            VALUES (${score})
        `;
        console.log(`[DB] Mood set to ${score}.`);
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

module.exports = { setMood, getMood };
