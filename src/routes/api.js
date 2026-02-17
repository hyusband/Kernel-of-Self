const express = require('express');
const router = express.Router();
const { triggerWakeup } = require('../controllers/wakeupController');
const { updateMood, getMood, getHistory } = require('../controllers/moodController');
const { trackSleep } = require('../controllers/sleepController');
const { chatWithOracle } = require('../services/oracle');
const { analyzeEntries } = require('../controllers/analysisController');

const { register, login } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/wakeup', authenticateToken, triggerWakeup);
router.get('/mood', authenticateToken, getMood);
router.get('/history', authenticateToken, getHistory);
router.post('/mood', authenticateToken, updateMood);
router.get('/sleep', authenticateToken, trackSleep);

router.post('/analyze', authenticateToken, analyzeEntries);

router.post('/chat', authenticateToken, async (req, res) => {
    const { message, history } = req.body;
    const userId = req.user.id;

    if (!message) return res.status(400).json({ error: "Message required" });

    try {
        const reply = await chatWithOracle(message, history, userId);
        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Oracle unreachable" });
    }
});

module.exports = router;
