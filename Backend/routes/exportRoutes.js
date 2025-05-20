const express = require('express');
const router = express.Router();
const controller = require('../controllers/exportController');

// Export a single table
router.get('/table', controller.exportTable);

// Export specific tables from one database
router.post('/database', controller.exportDatabase);

// Export all databases
router.post('/databases', controller.exportDatabases);

module.exports = router;
