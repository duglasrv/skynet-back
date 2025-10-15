// --- Dependencias y Middlewares ---

// Importa el framework Express para utilizar su funcionalidad de enrutador.
const express = require('express');
// Crea una nueva instancia del enrutador de Express para definir las rutas de este módulo.
const router = express.Router();
// Importa todos los controladores del archivo userController.
// Estos controladores contienen la lógica para crear, leer, actualizar y eliminar usuarios (CRUD).
const userController = require('../controllers/userController');
// Importa el middleware de autenticación 'protect' para asegurar que el usuario esté logueado.
const { protect } = require('../middlewares/authMiddleware');
// Importa el middleware de autorización 'checkRole' para restringir el acceso basado en el rol del usuario.
const { checkRole } = require('../middlewares/roleMiddleware');

// --- Definición de Rutas para la Gestión de Usuarios ---

// Utiliza `router.route('/')` para agrupar las rutas que operan sobre la colección de usuarios (ej: /api/users).
router.route('/')
    // Define la ruta para crear un nuevo usuario (POST /api/users).
    // Esta es una acción sensible, por lo que se protege con varios middlewares:
    // 1. `protect`: Asegura que la petición la hace un usuario autenticado.
    // 2. `checkRole(['ADMIN'])`: Asegura que el usuario autenticado tiene exclusivamente el rol de 'ADMIN'.
    // 3. `userController.createUser`: Si ambos middlewares pasan, se ejecuta el controlador para crear el usuario.
    .post(protect, checkRole(['ADMIN']), userController.createUser)

    // Define la ruta para obtener la lista de todos los usuarios (GET /api/users).
    // Esta ruta tiene permisos ligeramente diferentes:
    // 1. `protect`: Requiere autenticación.
    // 2. `checkRole(['ADMIN', 'SUPERVISOR'])`: Permite el acceso tanto a usuarios 'ADMIN' como 'SUPERVISOR'.
    // 3. `userController.getAllUsers`: El controlador que devuelve la lista de usuarios.
    .get(protect, checkRole(['ADMIN', 'SUPERVISOR']), userController.getAllUsers);

// Utiliza `router.route('/:id')` para agrupar las rutas que operan sobre un usuario específico,
// identificado por un ID en la URL (ej: /api/users/123).
router.route('/:id')
    // Define la ruta para obtener un usuario por su ID (GET /api/users/:id).
    // Solo los administradores pueden ver los detalles de un usuario específico.
    .get(protect, checkRole(['ADMIN']), userController.getUserById)

    // Define la ruta para actualizar un usuario por su ID (PUT /api/users/:id).
    // La actualización de datos de usuario también está restringida solo a administradores.
    .put(protect, checkRole(['ADMIN']), userController.updateUser)

    // Define la ruta para eliminar un usuario por su ID (DELETE /api/users/:id).
    // Eliminar usuarios es una acción crítica, por lo que está correctamente restringida a administradores.
    .delete(protect, checkRole(['ADMIN']), userController.deleteUser);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con todas las rutas de gestión de usuarios configuradas.
// Este módulo será importado en el archivo principal del servidor (app.js o server.js).
module.exports = router;