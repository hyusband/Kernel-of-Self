const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function initDB() {
    try {
        console.log('Initializing database schema...');

        const result1 = await sql`
            CREATE TABLE IF NOT EXISTS moods (
                id SERIAL PRIMARY KEY,
                score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Table "moods" created or verified successfully.');

        const result2 = await sql`
            CREATE TABLE IF NOT EXISTS sleep_logs (
                id SERIAL PRIMARY KEY,
                duration NUMERIC(4, 1) NOT NULL,
                quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Table "sleep_logs" created or verified successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit();
    }
}

initDB();
