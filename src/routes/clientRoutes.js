// --- Dependencias y Middlewares ---

// Importa el framework Express para utilizar su funcionalidad de enrutador.
const express = require('express');
// Crea una nueva instancia del enrutador de Express para definir las rutas de este módulo.
const router = express.Router();
// Importa todos los controladores del archivo clientController.
// El controlador contiene la lógica para interactuar con la base de datos (crear, leer, actualizar, borrar clientes).
const clientController = require('../controllers/clientController');
// Importa el middleware de autenticación 'protect'. Este middleware se asegura de que el usuario esté logueado
// verificando la validez de su token JWT antes de permitir el acceso a la ruta.
const { protect } = require('../middlewares/authMiddleware');
// Importa el middleware de autorización 'checkRole'. Este middleware verifica si el rol del usuario logueado
// coincide con los roles permitidos para acceder a una ruta específica.
const { checkRole } = require('../middlewares/roleMiddleware');

// --- Definición de Roles Permitidos ---

// Se define un array con los roles que tienen permiso para acceder a estas rutas.
// Esto mejora la legibilidad y facilita el mantenimiento, ya que si los roles cambian,
// solo se necesita modificar este array en un único lugar.
const supervisorOrAdmin = ['ADMIN', 'SUPERVISOR'];

// --- Definición de Rutas para Clientes ---

// Se utiliza `router.route('/')` para encadenar múltiples métodos HTTP (POST, GET) a la misma URL base (`/api/clients`).
// Esto hace que el código sea más limpio y organizado.
router.route('/')
    // Define la ruta para crear un nuevo cliente (POST /api/clients).
    // La petición pasa por tres "pasos" o middlewares antes de llegar al controlador final:
    // 1. `protect`: Verifica que el usuario esté autenticado.
    // 2. `checkRole(supervisorOrAdmin)`: Verifica que el usuario autenticado sea ADMIN o SUPERVISOR.
    // 3. `clientController.createClient`: Si las verificaciones anteriores son exitosas, se ejecuta la lógica para crear el cliente.
    .post(protect, checkRole(supervisorOrAdmin), clientController.createClient)
    
    // Define la ruta para obtener la lista de todos los clientes (GET /api/clients).
    // También está protegida y solo es accesible para administradores y supervisores.
    .get(protect, checkRole(supervisorOrAdmin), clientController.getAllClients);

// Se utiliza `router.route('/:id')` para encadenar métodos a rutas que contienen un parámetro dinámico,
// en este caso, el ID del cliente (ej: /api/clients/123).
router.route('/:id')
    // Define la ruta para obtener un cliente específico por su ID (GET /api/clients/:id).
    .get(protect, checkRole(supervisorOrAdmin), clientController.getClientById)
    
    // Define la ruta para actualizar un cliente específico por su ID (PUT /api/clients/:id).
    .put(protect, checkRole(supervisorOrAdmin), clientController.updateClient)
    
    // Define la ruta para eliminar un cliente específico por su ID (DELETE /api/clients/:id).
    .delete(protect, checkRole(supervisorOrAdmin), clientController.deleteClient);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con todas las rutas de clientes configuradas.
// Este módulo será importado en el archivo principal del servidor (app.js o server.js)
// para ser utilizado por la aplicación Express.
module.exports = router;