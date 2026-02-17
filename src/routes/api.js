const express = require('express');
const router = express.Router();
const { triggerWakeup } = require('../controllers/wakeupController');
const { updateMood, getMood } = require('../controllers/moodController');
const { trackSleep } = require('../controllers/sleepController');
const { chatWithOracle } = require('../services/oracle');

router.get('/wakeup', triggerWakeup);
router.get('/mood', getMood);
router.post('/mood', updateMood);
router.get('/sleep', trackSleep);

router.post('/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    try {
        const reply = await chatWithOracle(message, history);
        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Oracle unreachable" });
    }
});

module.exports = router;
