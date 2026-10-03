const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken, verifyRole } = require('../middlewares/auth');

router.get('/', verifyToken, assetController.getAllAssets);
router.get('/categories', verifyToken, assetController.getCategories);
router.post('/', verifyToken, verifyRole(['Master Admin']), assetController.createAsset);
router.put('/:id', verifyToken, verifyRole(['Master Admin']), assetController.updateAsset);
router.delete('/:id', verifyToken, verifyRole(['Master Admin']), assetController.deleteAsset);

module.exports = router;
