require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar todas las rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares globales
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Parsea bodies de request con formato JSON

// Rutas de la API
app.get('/api', (req, res) => {
    res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});