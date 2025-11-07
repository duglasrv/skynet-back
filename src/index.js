// Ruta: /skynet-back/src/index.js (Versión de Prueba de Estabilidad)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Crea la aplicación
const app = express();

// --- USA LA CONFIGURACIÓN DE CORS MÁS SIMPLE POSIBLE ---
app.use(cors());

// --- MIDDLEWARES BÁSICOS ---
app.use(express.json());

// --- LA ÚNICA RUTA QUE EXISTE ---
// Una ruta de salud que no hace nada más que responder.
app.get('/api/health', (req, res) => {
  console.log('Health check received!'); // Añadimos un log para ver si llega la petición
  res.status(200).json({ status: 'OK', message: 'API is ALIVE and STABLE!' });
});

// --- MANEJADOR DE 404 ---
// Cualquier otra ruta dará 404.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// --- ARRANQUE DEL SERVIDOR ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de PRUEBA corriendo en puerto ${PORT}`);
});