const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// Ruta especial para que el técnico vea sus visitas de hoy
router.get('/today', protect, checkRole(['TECHNICIAN']), visitController.getTechnicianTodayVisits);

router.route('/')
    .post(protect, checkRole(['SUPERVISOR']), visitController.createVisit)
    .get(protect, checkRole(['ADMIN', 'SUPERVISOR', 'TECHNICIAN']), visitController.getAllVisits);

router.post('/:id/checkin', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckIn);
router.post('/:id/checkout', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckOut);

module.exports = router;