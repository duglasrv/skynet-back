// --- Configuración Inicial ---

// Carga las variables de entorno desde un archivo .env en el objeto `process.env`.
// Es crucial que esta línea esté al principio para que todas las demás partes de la aplicación
// tengan acceso a las variables de entorno, como las credenciales de la base de datos o los secretos de JWT.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- Importación de Módulos de Rutas ---
// Se importan los archivos que definen las rutas para cada recurso de la API.
// Esta práctica mantiene el código organizado y separado por funcionalidades.
const authRoutes = require('./routes/authRoutes');          // Maneja las rutas de autenticación (ej: /login).
const userRoutes = require('./routes/userRoutes');          // Maneja las rutas para el CRUD (Crear, Leer, Actualizar, Borrar) de usuarios.
const clientRoutes = require('./routes/clientRoutes');        // Maneja las rutas para el CRUD de clientes.
const visitRoutes = require('./routes/visitRoutes');         // Maneja las rutas para el CRUD y gestión de visitas técnicas.
const dashboardRoutes = require('./routes/dashboardRoutes');  // Maneja las rutas para obtener datos agregados para el panel de control.
const reportRoutes = require('./routes/reportRoutes');        // Maneja las rutas para la generación de reportes.

// --- Creación de la Aplicación Express ---
// Se crea una instancia de la aplicación Express, que se usará para configurar el servidor.
const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL, // La URL de tu app en Vercel
    'http://localhost:3000'   // La URL de tu app en desarrollo
];

const corsOptions = {
    origin: (origin, callback) => {
        // Permite peticiones sin 'origin' (como las de Postman o apps móviles)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política de CORS para este sitio no permite acceso desde el origen especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

// --- Definición de las Rutas de la API ---

// Define una ruta GET simple en /api.
// A menudo se usa como un "health check" para verificar que la API está en funcionamiento.
app.get('/api', (req, res) => {
    res.json({ message: 'API de SkyNet está funcionando correctamente.' });
});

// "Monta" los enrutadores importados en prefijos de URL específicos.
// Todas las rutas definidas en el archivo 'authRoutes' estarán precedidas por '/api/auth'.
app.use('/api/auth', authRoutes);
// Todas las rutas en 'userRoutes' comenzarán con '/api/users'.
app.use('/api/users', userRoutes);
// Y así sucesivamente para cada módulo de rutas.
app.use('/api/clients', clientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// --- Arranque del Servidor ---

// Define el puerto en el que escuchará el servidor.
// Intenta obtener el puerto de una variable de entorno `PORT` (común en entornos de producción y despliegue).
// Si no la encuentra, utiliza el puerto 4000 como valor predeterminado (típico para desarrollo local).
const PORT = process.env.PORT || 4000;

// Inicia el servidor para que comience a escuchar peticiones HTTP en el puerto especificado.
// La función callback se ejecuta una vez que el servidor se ha iniciado con éxito.
app.listen(PORT, () => {
    // Imprime un mensaje en la consola para confirmar que el servidor está corriendo y en qué puerto.
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});