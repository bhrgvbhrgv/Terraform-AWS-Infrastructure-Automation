const serviceService = require('../services/serviceService');
const { VALID_STATUSES } = serviceService;

/**
 * Health check endpoint controller
 * Does NOT require database connection
 */
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'cloudops-status-api',
  });
};

/**
 * Get all services controller
 */
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await serviceService.getAllServices();
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID with history controller
 */
exports.getServiceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID provided. It must be a positive integer.',
      });
    }

    const service = await serviceService.getServiceById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: `Service with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service status controller
 */
exports.updateServiceStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid service ID provided. It must be a positive integer.',
      });
    }

    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        error: `Status is required. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const normalizedStatus = status.trim().toLowerCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status "${status}". Allowed values: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const updatedService = await serviceService.updateStatus(id, normalizedStatus);
    if (!updatedService) {
      return res.status(404).json({
        success: false,
        error: `Service with ID ${id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated successfully to ${normalizedStatus}.`,
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

