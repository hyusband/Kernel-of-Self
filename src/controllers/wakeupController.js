const { generateDailyMessage } = require('../services/ai');
const { sendNotification } = require('../services/notification');

async function triggerWakeup(req, res) {
    try {
        console.log('Initiating synchronization sequence...');
        const message = await generateDailyMessage();
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
