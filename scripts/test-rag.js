const { setMood } = require('../src/services/state');
const { chatWithOracle } = require('../src/services/oracle');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

async function testRAG() {
    const testUserId = '00000000-0000-0000-0000-000000009999';

    try {
        const hashedPassword = 'mock_hashed_password';
        await sql`
            INSERT INTO users (id, email, password_hash)
            VALUES (${testUserId}, 'test_rag@kernel.self', ${hashedPassword})
            ON CONFLICT (id) DO NOTHING
        `;

        console.log("📝 Inserting memory: 'I feel amazing when I drink matcha latte in the morning'");
        await setMood(9, "I feel amazing when I drink matcha latte in the morning", false, testUserId);

        await new Promise(r => setTimeout(r, 2000));

        const question = "What makes me feel amazing in the mornings?";
        console.log(`❓ Asking Oracle: "${question}"`);

        const answer = await chatWithOracle(question, [], testUserId);

        console.log("\n🔮 Oracle Answer:\n", answer);

        console.log("\n🧹 Cleaning up test data...");
        await sql`DELETE FROM moods WHERE user_id = ${testUserId}`;
        console.log("✅ Test Complete");

    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

testRAG();
