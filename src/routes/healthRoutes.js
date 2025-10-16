// File: src/routes/healthRoutes.js
// Generated: 2025-10-16 15:04:01 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_r8ydhca6ijv3


const express = require('express');


const logger = require('../utils/logger');


const mongoose = require('../config/database');


const router = express.Router();

/**
 * GET /
 * Health check endpoint
 * Returns API status and database connection status
 */
router.get('/', async (req, res, next) => {
  try {
    // Check MongoDB connection status
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    const isHealthy = dbState === 1;

    const healthStatus = {
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      api: {
        status: 'operational',
        uptime: process.uptime()
      },
      database: {
        status: dbStatus,
        type: 'MongoDB'
      }
    };

    logger.info('Health check performed', {
      status: healthStatus.status,
      dbStatus: dbStatus
    });

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });

    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      api: {
        status: 'operational'
      },
      database: {
        status: 'error',
        type: 'MongoDB'
      }
    });
  }
});

module.exports = router;
