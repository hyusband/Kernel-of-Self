const { setMood } = require('../services/state');

async function updateMood(req, res) {
    const { score } = req.query;

    if (!score || isNaN(score)) {
        return res.status(400).json({
            success: false,
            message: "Missing or invalid 'score' parameter (1-10). / Falta o es inválido el parámetro 'score' (1-10)."
        });
    }

    const numScore = parseInt(score, 10);
    if (numScore < 1 || numScore > 10) {
        return res.status(400).json({
            success: false,
            message: "Score must be between 1 and 10. / El puntaje debe estar entre 1 y 10."
        });
    }

    setMood(numScore);

    let feedback = "";
    if (numScore <= 4) feedback = "Recibido. Modo de recuperación activado. / Received. Recovery mode activated.";
    else if (numScore <= 7) feedback = "Recibido. Manteniendo el rumbo. / Received. Holding course.";
    else feedback = "Recibido. Excelente energía. A capitalizarla. / Received. Excellent energy. Capitalize on it.";

    res.status(200).json({
        success: true,
        message: feedback,
        current_mood: numScore
    });
}

module.exports = { updateMood };
