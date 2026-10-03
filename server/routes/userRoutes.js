const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/meta', verifyToken, userController.getRolesAndDepartments);
router.get('/', verifyToken, verifyRole(['Master Admin']), userController.getAllUsers);
router.post('/', verifyToken, verifyRole(['Master Admin']), userController.createUser);
router.put('/:id/toggle-status', verifyToken, verifyRole(['Master Admin']), userController.toggleUserStatus);

module.exports = router;
