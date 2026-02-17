const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration to add users table...');

        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Table "users" created.');

        await sql`
            ALTER TABLE moods 
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
        `;
        console.log('Column "user_id" added to "moods".');

        await sql`
            ALTER TABLE sleep_logs 
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
        `;
        console.log('Column "user_id" added to "sleep_logs".');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
