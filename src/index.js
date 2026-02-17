const express = require('express');
const apiRoutes = require('./routes/api');
const { requestLogger } = require('./middleware/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
    res.send('Kernel of Self activo. Sistemas sincronizados. / Kernel of Self is active. Systems synchronized.');
});

app.use('/api', apiRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Kernel of Self escuchando en el puerto ${PORT} / listening on port ${PORT}`);
    });
}

module.exports = app;
