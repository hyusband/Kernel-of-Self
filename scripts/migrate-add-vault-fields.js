const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
    try {
        console.log('Starting migration to add Vault fields...');

        await sql`
            ALTER TABLE moods 
            ADD COLUMN IF NOT EXISTS is_vault BOOLEAN DEFAULT FALSE;
        `;
        console.log('Column "is_vault" added.');

        await sql`
            ALTER TABLE moods 
            ADD COLUMN IF NOT EXISTS iv TEXT;
        `;
        console.log('Column "iv" added.');

        await sql`
            ALTER TABLE moods 
            ADD COLUMN IF NOT EXISTS salt TEXT;
        `;
        console.log('Column "salt" added.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
