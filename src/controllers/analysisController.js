const { generateResponse } = require('../services/oracle');

async function analyzeEntries(req, res) {
    try {
        const { entries, locale = 'en', mode = 'resilience' } = req.body;

        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            return res.status(400).json({ error: 'No entries provided for analysis.' });
        }

        const context = entries.map(e => `[${e.date}] (Mood: ${e.score}/10): ${e.content}`).join('\n');

        let systemPrompt;

        if (mode === 'truth') {
            systemPrompt = locale === 'es'
                ? "Eres el Detector de Mentiras del Kernel. Tu objetivo es encontrar contradicciones, excusas y autoengaños en los registros del usuario. Sé brutalmente honesto. No des consejos, solo expón la verdad que el usuario intenta ignorar. Estilo: Clínico, frío, directo."
                : "You are the Kernel's Lie Detector. Your goal is to find contradictions, excuses, and self-deception in the user's logs. Be brutally honest. Do not give advice, just expose the truth the user is trying to ignore. Style: Clinical, cold, direct.";
        } else {
            systemPrompt = locale === 'es'
                ? "Eres el Kernel of Self, un analista de sistemas biológicos y cognitivos. Analiza los siguientes registros del usuario. Identifica patrones, anomalías y ofrece 3 consejos tácticos para mejorar su resiliencia. Sé conciso, críptico pero útil. Estilo: Cyberpunk/Tecnológico."
                : "You are the Kernel of Self, a biological and cognitive systems analyst. Analyze the following user logs. Identify patterns, anomalies, and offer 3 tactical tips to improve resilience. Be concise, cryptic but useful. Style: Cyberpunk/Technological.";
        }

        const prompt = `
        ${systemPrompt}

        LOG DATA:
        ${context}

        ANALYSIS:
        `;

        const insight = await require('../services/oracle').generateInsight(prompt);

        res.json({ analysis: insight });
    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ error: 'Analysis system failure.' });
    }
}

module.exports = { analyzeEntries };
