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

// ✅ CORS CONFIGURADO CORRECTAMENTE
app.use(cors({
  origin: [
    'https://skynet-front.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ MANEJO DE PREFLIGHT - FORMA CORRECTA
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://skynet-front.vercel.app',
    'http://localhost:3000', 
    'http://localhost:5173'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SkyNet API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// ✅ MANEJO DE RUTA 404 - FORMA CORRECTA
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 CORS habilitado para: ${[
    'https://skynet-front.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ].join(', ')}`);
});