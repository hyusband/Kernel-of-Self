const { generateDailyMessage } = require('../services/ai');
const { sendNotification } = require('../services/notification');
const { getMood } = require('../services/state');

async function triggerWakeup(req, res) {
    try {
        console.log(res.__('wakeup.sync_start'));

        const currentMood = getMood();
        console.log(res.__('wakeup.context_mood', currentMood.score ? currentMood.score : 'Neutral'));

        const message = await generateDailyMessage(currentMood.score ? currentMood : null);
        console.log(res.__('wakeup.generated', message));

        await sendNotification(message);
        console.log(res.__('wakeup.sent'));

        res.status(200).json({ success: true, message: res.__('wakeup.success') });
    } catch (error) {
        console.error(res.__('wakeup.failed', error));
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = { triggerWakeup };
