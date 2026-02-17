const { setMood, getMood: fetchMoodHeader, getHistory: fetchHistory } = require('../services/state');

async function getMood(req, res) {
    try {
        const userId = req.user.id;
        const mood = await fetchMoodHeader(userId);
        res.json(mood || { score: null });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch mood" });
    }
}

async function updateMood(req, res) {
    const body = req.body || {};
    const score = body.score || req.query.score;
    const note = body.note || req.query.note;

    if (!score || isNaN(score)) {
        return res.status(400).json({
            success: false,
            message: res.__('mood.missing_score')
        });
    }

    const numScore = parseInt(score, 10);
    if (numScore < 1 || numScore > 10) {
        return res.status(400).json({
            success: false,
            message: res.__('mood.invalid_score')
        });
    }

    const isEncrypted = body.is_encrypted || false;
    const userId = req.user.id;
    const iv = body.iv || null;
    const salt = body.salt || null;

    await setMood(numScore, note, isEncrypted, userId, iv, salt);

    let feedback = "";
    if (numScore <= 4) feedback = res.__('mood.recovery');
    else if (numScore <= 7) feedback = res.__('mood.holding');
    else feedback = res.__('mood.excellent');

    res.status(200).json({
        success: true,
        message: feedback,
        current_mood: numScore
    });
}

async function getHistory(req, res) {
    try {
        const userId = req.user.id;
        const history = await fetchHistory(userId);
        res.json(history);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch history" });
    }
}

module.exports = { updateMood, getMood, getHistory };
