const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisitionController');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/', verifyToken, requisitionController.getRequisitions);
router.get('/email-logs', verifyToken, verifyRole(['Master Admin']), requisitionController.getEmailLogs);
router.get('/:id', verifyToken, requisitionController.getRequisitionById);
router.post('/', verifyToken, upload.array('attachments', 5), requisitionController.createRequisition);
router.put('/:id/status', verifyToken, verifyRole(['Master Admin']), requisitionController.updateRequisitionStatus);

module.exports = router;
