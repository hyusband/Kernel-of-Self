const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function initDB() {
    try {
        console.log('Initializing database schema...');

        const result = await sql`
            CREATE TABLE IF NOT EXISTS moods (
                id SERIAL PRIMARY KEY,
                score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        console.log('Table "moods" created or verified successfully.');
        console.log(result);
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        process.exit();
    }
}

initDB();
