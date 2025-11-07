// Ruta: /skynet-back/src/index.js (Versión Final)

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

// --- CONFIGURACIÓN DE CORS ---
// Esta es la única configuración de CORS que necesitas.
// Maneja automáticamente las peticiones OPTIONS (preflight).
app.use(cors({
  origin: [
    'https://skynet-front.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization'
}));

// --- MIDDLEWARES GLOBALES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- RUTAS DE LA API ---

// Ruta de salud para verificar que la API está viva
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkyNet API is running' });
});

// Ruta principal
app.get('/api', (req, res) => {
  res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

// Montar el resto de las rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// --- MANEJO DE RUTA 404 ---
// Esto debe ir al final, después de todas tus rutas válidas.
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});


// --- ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  // Console.log más preciso para el entorno de producción.
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});