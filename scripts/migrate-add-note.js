const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Migrating database...');
        await sql`ALTER TABLE moods ADD COLUMN IF NOT EXISTS note TEXT;`;
        console.log('Migration successful: Added "note" column to "moods".');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
