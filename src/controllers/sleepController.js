const { logSleep } = require('../services/state');

async function trackSleep(req, res) {
    const { hours, quality } = req.query;

    if (!hours || !quality) {
        return res.status(400).json({
            success: false,
            message: res.__('sleep.missing_params')
        });
    }

    const numHours = parseFloat(hours);
    const numQuality = parseInt(quality, 10);

    if (numQuality < 1 || numQuality > 5) {
        return res.status(400).json({
            success: false,
            message: res.__('sleep.invalid_quality')
        });
    }

    try {
        await logSleep(numHours, numQuality);

        let feedback = res.__('sleep.feedback.neutral');
        if (numQuality >= 4) feedback = res.__('sleep.feedback.good');
        if (numQuality <= 2) feedback = res.__('sleep.feedback.bad');

        res.status(200).json({
            success: true,
            message: feedback,
            data: { hours: numHours, quality: numQuality }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Database error" });
    }
}

module.exports = { trackSleep };
