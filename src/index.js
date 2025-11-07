// Ruta: /skynet-back/src/index.js (Versión con CORS Abierto para Depuración)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();


// --- CONFIGURACIÓN DE CORS TOTALMENTE PERMISIVA ---

// Esta configuración aceptará peticiones desde CUALQUIER origen,
// incluso cuando se envían con credenciales.
app.use(cors({
  // La función 'origin' se configura para aceptar siempre la petición,
  // devolviendo 'true' en el callback. Esto hace que el middleware refleje
  // el origen del solicitante en la cabecera Access-Control-Allow-Origin.
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization'
}));


// --- MIDDLEWARES GLOBALES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- RUTAS DE LA API ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkyNet API is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// --- MANEJO DE RUTA 404 ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// --- ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});