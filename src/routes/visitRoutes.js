
const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

// La ruta GET / ahora es el endpoint principal y filtrable para todos los roles
router.route('/')
    .post(protect, checkRole(['ADMIN', 'SUPERVISOR']), visitController.createVisit)
    .get(protect, visitController.getAllVisits); // Ya no se necesita checkRole aquí, la lógica está en el controller

router.post('/:id/checkin', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckIn);
router.post('/:id/checkout', protect, checkRole(['TECHNICIAN']), visitController.technicianCheckOut);

module.exports = router;