// Ruta: /src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

const { getDashboardData } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// @route   GET /api/dashboard
// @desc    Obtener los datos del dashboard según el rol del usuario
// @access  Private (todos los roles logueados pueden acceder)
router.get('/', protect, getDashboardData);

module.exports = router;