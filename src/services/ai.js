const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function generateDailyMessage(mood = null, sleep = null) {
    let systemPrompt = "Eres el 'Kernel de Uno Mismo' (Kernel of Self). Tu objetivo es proporcionar frases de resiliencia breves e impactantes o recordatorios filosóficos. Genera el mensaje en ESPAÑOL e INGLÉS. Formato: 'Texto en Español. / Text in English.' Manténlo bajo 280 caracteres en total. Sé directo, estoico y motivador.";

    if (mood) {
        systemPrompt += ` El usuario reportó un estado de ánimo de ${mood.score}/10. `;
        if (mood.score <= 4) systemPrompt += "El ánimo es bajo. Sé empático, validador pero firme en la reconstrucción.";
        else if (mood.score <= 7) systemPrompt += "El ánimo es neutral. Sé estoico y disciplinado.";
        else systemPrompt += "El ánimo es alto. Sé desafiante. Empújalo a lograr más.";
    }

    if (sleep) {
        systemPrompt += ` El usuario durmió ${sleep.duration} horas con calidad ${sleep.quality}/5. `;
        if (sleep.quality <= 2 || sleep.duration < 6) systemPrompt += "Hay fatiga física. Sugiere descanso estratégico o enfoque pasivo. No exijas demasiado físicamente.";
        else if (sleep.quality >= 4) systemPrompt += "La batería está cargada. Exige alto rendimiento cognitivo y físico.";
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
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
