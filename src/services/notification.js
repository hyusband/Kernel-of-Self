const axios = require('axios');

require('dotenv').config();

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'k-self-notifications';
const NTFY_URL = process.env.NTFY_URL || 'https://ntfy.sh';

async function sendNotification(message) {
    try {
        const response = await fetch(`${NTFY_URL}/${NTFY_TOPIC}`, {
            method: 'POST',
            body: message,
            headers: {
                'Title': 'Kernel of Self',
                'Priority': 'default',
                'Tags': 'brain,muscle'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to send notification: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
}

module.exports = { sendNotification };
