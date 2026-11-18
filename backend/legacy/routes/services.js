const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// GET /api/services - list all services
router.get('/services', serviceController.getAllServices);

// GET /api/services/:id - service details and history
router.get('/services/:id', serviceController.getServiceById);

// PATCH /api/services/:id/status - update service status
router.patch('/services/:id/status', serviceController.updateServiceStatus);

module.exports = router;

