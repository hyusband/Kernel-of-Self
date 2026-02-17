const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration to add embedding column...');

        await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
        console.log('Extension "vector" verified.');

        await sql`
            ALTER TABLE moods 
            ADD COLUMN IF NOT EXISTS embedding vector(384);
        `;
        console.log('Column "embedding" added to "moods" table.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
