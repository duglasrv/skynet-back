// --- Dependencias y Middlewares ---

// Importa el framework Express para utilizar su funcionalidad de enrutador.
const express = require('express');
// Crea una nueva instancia del enrutador de Express para definir las rutas de este módulo.
const router = express.Router();
// Importa todos los controladores del archivo visitController, que contienen la lógica de negocio para las visitas.
const visitController = require('../controllers/visitController');
// Importa el middleware de autenticación 'protect' para asegurar que el usuario esté logueado.
const { protect } = require('../middlewares/authMiddleware');
// Importa el middleware de autorización 'checkRole' para restringir el acceso basado en el rol del usuario.
const { checkRole } = require('../middlewares/roleMiddleware');

// --- Definición de Rutas para la Gestión de Visitas ---

// Utiliza `router.route('/')` para agrupar las rutas que operan sobre la colección de visitas (ej: /api/visits).
router.route('/')
    // Define la ruta para crear una nueva visita (POST /api/visits).
    // Esta acción está restringida a usuarios con rol 'ADMIN' o 'SUPERVISOR'.
    // 1. `protect`: Verifica que el usuario esté autenticado.
    // 2. `checkRole(['ADMIN', 'SUPERVISOR'])`: Verifica que el rol sea el permitido.
    // 3. `visitController.createVisit`: Si todo es correcto, ejecuta el controlador para crear la visita.
    .post(protect, checkRole(['ADMIN', 'SUPERVISOR']), visitController.createVisit)

    // Define la ruta para obtener la lista de todas las visitas (GET /api/visits).
    // Esta ruta está protegida solo por `protect`, lo que significa que cualquier usuario autenticado
    // (ADMIN, SUPERVISOR, TECHNICIAN) puede acceder a ella.
    // Como indica el comentario, el middleware `checkRole` no es necesario aquí porque la lógica de
    // qué visitas puede ver cada rol (un técnico solo ve las suyas, un supervisor las de su equipo, etc.)
    // está implementada directamente dentro del controlador `getAllVisits`.
    .get(protect, visitController.getAllVisits);

// Define la ruta para que un técnico realice un "check-in" en una visita específica (POST /api/visits/:id/checkin).
// El `:id` en la URL corresponde al ID de la visita.
// Esta acción está específicamente restringida a usuarios con el rol 'TECHNICIAN'.
router.post('/:id/checkin', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckIn);

// Define la ruta para que un técnico realice un "check-out" de una visita específica (POST /api/visits/:id/checkout).
// Al igual que el check-in, esta es una acción exclusiva para los técnicos.
router.post('/:id/checkout', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckOut);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con todas las rutas de gestión de visitas configuradas.
// Este módulo será importado y utilizado por la aplicación principal de Express en el archivo del servidor.
module.exports = router;