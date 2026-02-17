const express = require('express');
const apiRoutes = require('./routes/api');
const { requestLogger } = require('./middleware/logger');
const i18n = require('./config/i18n');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(i18n.init);
app.use(requestLogger);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' }, (err) => {
        if (err) res.send(res.__('system.active'));
    });
});

app.use('/api', apiRoutes);

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Kernel of Self escuchando en el puerto ${PORT} / listening on port ${PORT}`);
    });
}

module.exports = app;
