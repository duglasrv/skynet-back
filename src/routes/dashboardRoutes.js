// Ruta: /src/routes/dashboardRoutes.js

// --- Dependencias y Middlewares ---

// Importa el framework Express para poder utilizar su funcionalidad de enrutador.
const express = require('express');
// Crea una nueva instancia del enrutador de Express. Este objeto se usará para definir
// todas las rutas relacionadas con el dashboard.
const router = express.Router();

// Importa el controlador `getDashboardData` desde el archivo dashboardController.
// Este controlador contiene la lógica principal para recopilar y formatear los datos del dashboard.
const { getDashboardData } = require('../controllers/dashboardController');
// Importa el middleware de autenticación 'protect'. Este middleware se asegura de que
// cualquier usuario que intente acceder a esta ruta esté debidamente autenticado (logueado).
const { protect } = require('../middlewares/authMiddleware');

// --- Definición de la Ruta del Dashboard ---

// Estos comentarios son una buena práctica para documentar la API de forma clara.
// @route   GET /api/dashboard
//          - Método HTTP: GET
//          - URL completa: /api/dashboard (el prefijo /api se define en el archivo principal del servidor)
// @desc    Obtener los datos del dashboard según el rol del usuario
//          - Explica qué hace este endpoint. La lógica para diferenciar por rol estará dentro del controlador.
// @access  Private (todos los roles logueados pueden acceder)
//          - Indica que la ruta es privada y requiere autenticación. A diferencia de otras rutas,
//            no utiliza `checkRole`, por lo que cualquier usuario autenticado (ADMIN, SUPERVISOR, TECHNICIAN)
//            puede acceder a ella.

// Define una ruta para el método GET en la raíz de este enrutador ('/').
// La petición seguirá estos pasos:
// 1. Llega la petición a `GET /api/dashboard`.
// 2. Se ejecuta el middleware `protect`: verifica el token JWT. Si no es válido, rechaza la petición.
// 3. Si el token es válido, se ejecuta el controlador `getDashboardData`, que se encarga de la lógica final.
router.get('/', protect, getDashboardData);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con la ruta del dashboard configurada.
// Este módulo será importado y utilizado por la aplicación principal de Express.
module.exports = router;