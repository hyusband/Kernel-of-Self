const { Groq } = require('groq-sdk');
const { pipeline } = require('@xenova/transformers');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

let extractor = null;

/*
  Ya lo implemente, ( Ahora sigue mi flujo de abajo ) 
  Esto tiene que estar por usuario, actualmente el flujo es systempromt - systemHistory ( no tiene contexto real del historial del usuario, simplemente agarra un contexto global de la charla )
*/

async function getExtractor() {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

async function generateEmbedding(text) {
    const pipe = await getExtractor();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}

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
            `[${new Date(log.created_at).toLocaleDateString()}] Mood: ${log.score}/10. Note: "${log.note}"`
        ).join('\n');

        const systemPrompt = `
            You are "The Oracle", a digital construct of the user's past self.
            You have access to their past logs (moods and notes).
            
            CONTEXT FROM PAST LOGS:
            ${contextText}

            INSTRUCTIONS:
            - **LANGUAGE DETECTION**: Identify if the user is speaking Spanish or English. Respond in the SAME language.
            - Answer the user's question based on patterns in the context.
            - If the context doesn't have the answer, use your general knowledge but mention you don't recall that specific detail.
            - Be philosophical, slightly cryptic but helpful. Tone: "Cyberpunk Stoic".
            - Keep responses concise (under 150 words).
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

module.exports = {
    generateEmbedding,
    chatWithOracle
};
