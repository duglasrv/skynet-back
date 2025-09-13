// Ruta: /src/routes/reportRoutes.js

const express = require('express');
const router = express.Router();

const { getReports, generateReportPdf } = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const allowedRoles = ['ADMIN', 'SUPERVISOR'];

// Ruta para obtener la lista de reportes
router.get('/', protect, checkRole(allowedRoles), getReports);

// Ruta para generar el PDF de un reporte específico por su ID de visita
router.get('/:visitId/pdf', protect, checkRole(allowedRoles), generateReportPdf);

module.exports = router;