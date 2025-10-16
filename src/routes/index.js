// File: src/routes/index.js
// Generated: 2025-10-16 15:04:07 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_9wplq59mp3ew


const bookRoutes = require('./bookRoutes');


const express = require('express');


const healthRoutes = require('./healthRoutes');


const logger = require('../utils/logger');


const router = express.Router();

/**
 * Route Aggregator
 * Combines all route modules and exports single router
 */

// Mount health check routes
router.use('/health', healthRoutes);

// Mount book routes
router.use('/books', bookRoutes);

// Log route registration
logger.info('Routes registered', {
  routes: ['/health', '/books']
});

module.exports = router;
