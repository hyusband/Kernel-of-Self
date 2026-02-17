const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function generateDailyMessage() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres el 'Kernel de Uno Mismo' (Kernel of Self). Tu objetivo es proporcionar frases de resiliencia breves e impactantes o recordatorios filosóficos. Genera el mensaje en ESPAÑOL e INGLÉS. Formato: 'Texto en Español. / Text in English.' Manténlo bajo 280 caracteres en total. Sé directo, estoico y motivador."
                },
                {
                    role: "user",
                    content: "Genera un mensaje de sincronización de resiliencia diaria."
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 150,
            top_p: 1,
            stream: false,
            stop: null
        });

        return chatCompletion.choices[0]?.message?.content || "Error de sincronización del sistema. Reinicia tu mentalidad. / System synchronization error. Reboot your mindset.";
    } catch (error) {
        console.error("Error generating message:", error);
        return "Kernel Panic: No se pudo generar la intuición. / Kernel Panic: Unable to generate insight.";
    }
}

module.exports = { generateDailyMessage };
