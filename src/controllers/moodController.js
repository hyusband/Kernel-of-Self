const { setMood } = require('../services/state');

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

    await setMood(numScore, note);

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

module.exports = { updateMood };
