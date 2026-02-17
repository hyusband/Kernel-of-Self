const { generateDailyMessage } = require('../services/ai');
const { sendNotification } = require('../services/notification');
const { getMood, getLatestSleep } = require('../services/state');

async function triggerWakeup(req, res) {
    try {
        console.log(res.__('wakeup.sync_start'));

        const userId = req.user.id;
        const currentMood = await getMood(userId);
        console.log(res.__('wakeup.context_mood', currentMood.score ? currentMood.score : 'Neutral'));

        const currentSleep = await getLatestSleep(userId);
        if (currentSleep) console.log(`Sleep Context: ${currentSleep.duration}h (Q: ${currentSleep.quality})`);

        const message = await generateDailyMessage(
            currentMood.score ? currentMood : null,
            currentSleep
        );
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
