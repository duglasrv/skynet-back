// Ruta: /src/routes/reportRoutes.js

// --- Dependencias y Middlewares ---

// Importa el framework Express para usar su funcionalidad de enrutador.
const express = require('express');
// Crea una nueva instancia del enrutador de Express para definir las rutas de este módulo.
const router = express.Router();

// Importa los controladores específicos desde el archivo reportController.
// - getReports: Obtiene una lista de reportes en formato JSON.
// - generateReportPdf: Genera un PDF para un reporte individual.
// - exportReportsAsCsv: Exporta una lista de reportes a un archivo CSV.
const { getReports, generateReportPdf, exportReportsAsCsv } = require('../controllers/reportController');

// Importa el middleware de autenticación 'protect' para asegurar que el usuario esté logueado.
const { protect } = require('../middlewares/authMiddleware');
// Importa el middleware de autorización 'checkRole' para restringir el acceso basado en el rol del usuario.
const { checkRole } = require('../middlewares/roleMiddleware');

// --- Definición de Roles Permitidos ---

// Define un array con los roles que tienen permiso para acceder a todas las rutas de este módulo.
// Usar una variable hace que el código sea más limpio y fácil de mantener.
const allowedRoles = ['ADMIN', 'SUPERVISOR'];

// --- Definición de Rutas para Reportes ---

// Define la ruta para obtener la lista de reportes en formato JSON (GET /api/reports).
// La petición es procesada por los middlewares en orden:
// 1. `protect`: Verifica la autenticación del usuario.
// 2. `checkRole(allowedRoles)`: Verifica que el rol del usuario sea 'ADMIN' o 'SUPERVISOR'.
// 3. `getReports`: Si las verificaciones pasan, se ejecuta el controlador para obtener los datos.
router.get('/', protect, checkRole(allowedRoles), getReports);

// Define una nueva ruta para exportar la lista de reportes a un archivo CSV (GET /api/reports/export/csv).
// Utiliza los mismos middlewares de protección que la ruta anterior.
// El controlador `exportReportsAsCsv` se encargará de generar el archivo CSV y enviarlo como respuesta.
router.get('/export/csv', protect, checkRole(allowedRoles), exportReportsAsCsv);

// Define la ruta para generar y descargar un PDF de un reporte de visita específico.
// La URL incluye un parámetro dinámico `:visitId` (ej: /api/reports/123/pdf).
// También está protegida para que solo administradores y supervisores puedan acceder.
router.get('/:visitId/pdf', protect, checkRole(allowedRoles), generateReportPdf);

// --- Exportación del Módulo ---

// Exporta el objeto 'router' con todas las rutas de reportes configuradas.
// Este módulo será importado y utilizado por la aplicación principal de Express.
module.exports = router;