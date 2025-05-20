const express = require('express');
const router = express.Router();
const controller = require('../controllers/credentialController');

router.post('/check-credentials', controller.checkCredentials);
router.post('/save-credentials', controller.saveCredentials);
router.get('/connection/all', controller.getAllCredentials);
router.delete('/connection', controller.deleteCredential);
router.get('/connection/databases', controller.getDatabasesAndTables);
router.get('/insert', controller.insertDummyValues);

module.exports = router;
