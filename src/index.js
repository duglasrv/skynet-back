// --- Configuración Inicial ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- Importación de Módulos de Rutas ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

// --- Creación de la Aplicación Express ---
const app = express();


// --- CONFIGURACIÓN DE CORS SIMPLIFICADA ---
// Al llamar a cors() sin opciones, se permite el acceso desde CUALQUIER origen (*).
// Esto es ideal para depurar y para APIs públicas.
// Express gestionará automáticamente las peticiones OPTIONS (preflight) por ti.
app.use(cors());


// --- Middlewares Globales ---
// Habilita el parseo de cuerpos de solicitud en formato JSON.
app.use(express.json());


// --- Definición de las Rutas de la API ---
app.get('/api', (req, res) => {
    res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

// Monta los enrutadores importados en sus prefijos de URL.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);


// --- Arranque del Servidor ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});