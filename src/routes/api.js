const express = require('express');
const router = express.Router();
const { triggerWakeup } = require('../controllers/wakeupController');

router.get('/wakeup', triggerWakeup);

module.exports = router;
