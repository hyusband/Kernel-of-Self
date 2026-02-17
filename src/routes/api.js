const express = require('express');
const router = express.Router();
const { triggerWakeup } = require('../controllers/wakeupController');
const { updateMood } = require('../controllers/moodController');
const { trackSleep } = require('../controllers/sleepController');

router.get('/wakeup', triggerWakeup);
router.get('/mood', updateMood);
router.post('/mood', updateMood);
router.get('/sleep', trackSleep);

module.exports = router;
