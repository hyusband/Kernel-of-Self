const express = require('express');
const { generateDailyMessage } = require('./services/ai');
const { sendNotification } = require('./services/notification');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Kernel of Self is active. Systems synchronized.');
});

app.get('/api/wakeup', async (req, res) => {
    if (req.query.secret !== process.env.CRON_SECRET) return res.status(401).send('Unauthorized');
    try {
        console.log('Initiating synchronization sequence...');
        const message = await generateDailyMessage();
        console.log('Generated message:', message);
        
        await sendNotification(message);
        console.log('Notification sent.');

        res.status(200).json({ success: true, message: 'Synchronization complete.' });
    } catch (error) {
        console.error('Synchronization failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Kernel of Self listening on port ${PORT}`);
});

module.exports = app;
