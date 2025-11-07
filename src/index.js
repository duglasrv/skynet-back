// --- Configuración Inicial ---

// Carga las variables de entorno desde un archivo .env
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


// --- CONFIGURACIÓN DE CORS ROBUSTA Y COMPLETA ---

// 1. Define la lista de orígenes (dominios) que tienen permiso para conectarse.
const allowedOrigins = [
    process.env.FRONTEND_URL, // La URL de tu app en Vercel (ej: https://skynet-front.vercel.app)
    'http://localhost:3000'   // La URL que usas para desarrollo local
];

// 2. Crea las opciones de configuración para el middleware 'cors'.
const corsOptions = {
    // La función 'origin' verifica si la petición viene de un dominio permitido.
    origin: (origin, callback) => {
        // Permitimos la petición si el origen está en nuestra lista blanca
        // o si no hay origen (peticiones desde el mismo servidor, Postman, etc.).
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por la política de CORS'));
        }
    },
    // 3. Define los métodos HTTP permitidos (CRUCIAL para el error de preflight).
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',

    // 4. Define las cabeceras que el frontend puede enviar (CRUCIAL para el error de preflight).
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',

    // 5. Permite que el navegador envíe credenciales (cookies, tokens de autorización).
    credentials: true,
    
    // Código de estado para respuestas exitosas a peticiones de sondeo (OPTIONS).
    optionsSuccessStatus: 200
};

// 6. Usa el middleware de CORS con la configuración completa.
app.use(cors(corsOptions));


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