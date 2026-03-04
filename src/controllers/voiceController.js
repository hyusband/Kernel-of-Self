const { transcribeAudio, processVoiceText } = require('../services/oracle');
const { setMood } = require('../services/state');
const fs = require('fs');

async function handleVoiceJournal(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded.' });
        }

        const userId = req.user.id;
        const filePath = req.file.path;

        const transcript = await transcribeAudio(filePath);

        if (!transcript || transcript.trim() === '') {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'Could not transcribe any speech.' });
        }

        const processed = await processVoiceText(transcript);

        const categoryTag = processed.category ? `[${processed.category}] ` : '';
        const finalNote = `${categoryTag}${processed.refined_text} (Transcribed from Voice)`;

        const isClientEncrypted = req.query.encrypt === 'true';

        if (!isClientEncrypted) {
            await setMood(null, finalNote, false, userId);
        }

        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'Voice journal saved successfully.',
            data: {
                original_transcript: transcript,
                category: processed.category,
                refined_text: processed.refined_text
            }
        });
    } catch (error) {
        console.error('Voice Journal Error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Internal server error processing voice journal.' });
    }
}

module.exports = {
    handleVoiceJournal
};
