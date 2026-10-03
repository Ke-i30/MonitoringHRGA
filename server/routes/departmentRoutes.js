const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/', verifyToken, departmentController.getAllDepartments);
router.post('/', verifyToken, verifyRole(['Master Admin']), departmentController.createDepartment);
router.put('/:id', verifyToken, verifyRole(['Master Admin']), departmentController.updateDepartment);
router.put('/:id/toggle-status', verifyToken, verifyRole(['Master Admin']), departmentController.toggleDepartmentStatus);

module.exports = router;
