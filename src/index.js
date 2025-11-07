// Ruta: /skynet-back/src/index.js (Versión Final y Definitiva)

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


// --- CONFIGURACIÓN DE CORS CON FUNCIÓN DE ORIGEN (LA FORMA MÁS ROBUSTA) ---

// 1. Define tu lista de orígenes permitidos en una constante.
const allowedOrigins = [
  'https://skynet-front.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

// 2. Usa el middleware de CORS con una configuración que incluye una función para 'origin'.
app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones si el origen está en la lista blanca
    // o si la petición no tiene origen (como desde Postman o una app móvil).
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Si el origen no está permitido, rechaza la petición.
      callback(new Error('No permitido por la política de CORS'));
    }
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