const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

router.route('/')
    .post(protect, checkRole(['ADMIN']), userController.createUser)
    .get(protect, checkRole(['ADMIN', 'SUPERVISOR']), userController.getAllUsers);

router.route('/:id')
    .get(protect, checkRole(['ADMIN']), userController.getUserById)
    .put(protect, checkRole(['ADMIN']), userController.updateUser)
    .delete(protect, checkRole(['ADMIN']), userController.deleteUser);

module.exports = router;