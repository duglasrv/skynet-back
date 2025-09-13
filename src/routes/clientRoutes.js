const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect } = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const supervisorOrAdmin = ['ADMIN', 'SUPERVISOR'];

router.route('/')
    .post(protect, checkRole(supervisorOrAdmin), clientController.createClient)
    .get(protect, checkRole(supervisorOrAdmin), clientController.getAllClients);

router.route('/:id')
    .get(protect, checkRole(supervisorOrAdmin), clientController.getClientById)
    .put(protect, checkRole(supervisorOrAdmin), clientController.updateClient)
    .delete(protect, checkRole(supervisorOrAdmin), clientController.deleteClient);

module.exports = router;