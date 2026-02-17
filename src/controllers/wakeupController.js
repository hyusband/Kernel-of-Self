const { generateDailyMessage } = require('../services/ai');
const { sendNotification } = require('../services/notification');
const { getMood } = require('../services/state');

async function triggerWakeup(req, res) {
    try {
        console.log('Initiating synchronization sequence...');

        const currentMood = getMood();
        console.log(`Contextualizing for mood: ${currentMood.score ? currentMood.score : 'Neutral'}`);

        const message = await generateDailyMessage(currentMood.score ? currentMood : null);
        console.log('Generated message:', message);

        await sendNotification(message);
        console.log('Notification sent.');

        res.status(200).json({ success: true, message: 'Sincronización completa. / Synchronization complete.' });
    } catch (error) {
        console.error('Synchronization failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { triggerWakeup };
