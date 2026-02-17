const express = require('express');
const router = express.Router();
const { triggerWakeup } = require('../controllers/wakeupController');
const { updateMood } = require('../controllers/moodController');

router.get('/wakeup', triggerWakeup);
router.get('/mood', updateMood);

module.exports = router;
