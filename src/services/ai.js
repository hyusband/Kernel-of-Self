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
                    content: "You are the 'Kernel of Self', a system designed to resynchronize the user's mind and body. Your goal is to provide brief, impactful resilience quotes or philosophical reminders to help the user start their day with focus and purpose. Keep it under 280 characters. Be direct, not flowery."
                },
                {
                    role: "user",
                    content: "Generate a daily resilience synchronization message."
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 100,
            top_p: 1,
            stream: false,
            stop: null
        });

        return chatCompletion.choices[0]?.message?.content || "System synchronization error. Reboot your mindset.";
    } catch (error) {
        console.error("Error generating message:", error);
        return "Kernel panic: Unable to generate insight. innovative self-repair initiated.";
    }
}

module.exports = { generateDailyMessage };
