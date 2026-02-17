/*
// In-memory state (resets on server restart/cold start) // TODO: Implementar base de datos, actualmente esta solamente en memoria
// In a production environment, use a database (Redis/Postgres). // Usare Postgress para la base de datos ( Implemento ahorita xd)
*/

let currentMood = {
    score: null, // 1-10
    timestamp: null
};

function setMood(score) {
    currentMood.score = parseInt(score, 10);
    currentMood.timestamp = new Date();
    console.log(`[State] Mood set to ${currentMood.score} at ${currentMood.timestamp}`);
}

function getMood() {
    return currentMood;
}

module.exports = { setMood, getMood };
