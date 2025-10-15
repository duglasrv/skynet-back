// --- Dependencias ---

// Importa el framework Express. Aunque se usa para crear la aplicación principal,
// también se necesita aquí para acceder a su funcionalidad de enrutador.
const express = require('express');

// Crea una nueva instancia del enrutador de Express.
// El Router funciona como un "mini-app" que puede agrupar y organizar un conjunto de rutas relacionadas.
const router = express.Router();

// Importa el controlador `login` desde el archivo authController.
// El controlador contiene la lógica de negocio real (verificar usuario, generar token, etc.).
// Se utiliza la desestructuración `{ login }` para importar solo esa función específica del archivo.
const { login } = require('../controllers/authController');

// --- Definición de la Ruta ---

// Estos comentarios son una buena práctica para documentar la API.
// @route   POST /api/auth/login
//          - Método HTTP: POST
//          - URL completa: /api/auth/login (el prefijo /api/auth se define en el archivo principal de la app)
// @desc    Autenticar usuario y obtener token
//          - Describe brevemente lo que hace el endpoint.
// @access  Public
//          - Indica que esta ruta no requiere autenticación previa (cualquiera puede intentar iniciar sesión).

// Asocia la ruta '/login' con el método HTTP POST y el controlador 'login'.
// Cuando el servidor recibe una petición POST a la URL '/api/auth/login',
// Express ejecutará la función 'login' que se importó del controlador.
router.post('/login', login);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con todas las rutas que se han definido en este archivo.
// Esto permite que el archivo principal de la aplicación (server.js o app.js) pueda importarlo
// y "montarlo" en la aplicación principal con `app.use('/api/auth', authRoutes);`.
module.exports = router;