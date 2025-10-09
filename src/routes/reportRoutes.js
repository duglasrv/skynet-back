// Ruta: /src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { getReports, generateReportPdf, exportReportsAsCsv } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const allowedRoles = ['ADMIN', 'SUPERVISOR'];

// Ruta para obtener la lista de reportes (ahora filtrable)
router.get('/', protect, checkRole(allowedRoles), getReports);

// NUEVA RUTA para exportar el listado general a CSV
router.get('/export/csv', protect, checkRole(allowedRoles), exportReportsAsCsv);

// Ruta para generar el PDF de un reporte específico
router.get('/:visitId/pdf', protect, checkRole(allowedRoles), generateReportPdf);

module.exports = router;