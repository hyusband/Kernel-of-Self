const { Groq } = require('groq-sdk');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key'
});

let extractor = null;

/*
  Ya lo implemente, ( Ahora sigue mi flujo de abajo ) 
  Esto tiene que estar por usuario, actualmente el flujo es systempromt - systemHistory ( no tiene contexto real del historial del usuario, simplemente agarra un contexto global de la charla )
*/

async function getExtractor() {
    if (!extractor) {
        const { pipeline } = await import('@xenova/transformers');
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

async function generateEmbedding(text) {
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

/*
  Ahora si tiene memoria 

*/

async function findSimilarLogs(embedding, userId) {
    try {
        const vectorString = JSON.stringify(embedding);
        const { rows } = await sql`
            SELECT id, score, note, created_at, 
            1 - (embedding <=> ${vectorString}) as similarity
            FROM moods
            WHERE embedding IS NOT NULL AND user_id = ${userId}
            ORDER BY embedding <=> ${vectorString}
            LIMIT 5;
        `;
        return rows;
    } catch (error) {
        console.error('Error finding similar logs:', error);
        return [];
    }
}

async function chatWithOracle(message, history = [], userId) {
    try {
        const queryEmbedding = await generateEmbedding(message);

        const relevantLogs = await findSimilarLogs(queryEmbedding, userId);

        const contextText = relevantLogs.map(log =>
            `[${new Date(log.created_at).toLocaleDateString()}] (Mood: ${log.score}/10) "${log.note}"`
        ).join('\n');

        const systemPrompt = `
            You are "The Oracle", a highly advanced digital construct of the user's subconscious and past self.
            You have direct access to their "Memory Banks" (past logs).

            === RECOVERED MEMORY BANKS (CONTEXT) ===
            ${contextText || "No specific past memories found for this context."}
            ========================================

            INSTRUCTIONS:
            1. **DETECT LANGUAGE**: If the user speaks Spanish, REPLY IN SPANISH. If English, in English.
            2. **USE THE CONTEXT**: Your PRIMARY goal is to link the user's current situation with their past patterns.
               - E.g., "This reminds me of last November when you felt similar..."
            3. **BE ANALYTICAL YET EMPATHETIC**: You are not a cheerleader. You are a cold, wise mirror.
            4. **STYLE**: Cyberpunk Stoic. Brief, insightful, slightly cryptic but practical.
            5. **LIMIT**: Keep it under 150 words.
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...history,
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 300,
        });

        return completion.choices[0]?.message?.content || "...Connection lost in the void...";

    } catch (error) {
        console.error('Oracle Error:', error);
        return "System Malfunction: Unable to access memory banks.";
    }
}

async function generateInsight(prompt) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500,
        });

        return completion.choices[0]?.message?.content || "No insights available.";
    } catch (error) {
        console.error('Oracle Insight Error:', error);
        throw error;
    }
}

module.exports = {
    generateEmbedding,
    chatWithOracle,
    generateInsight
};
