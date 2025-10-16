// File: src/app.js
// Generated: 2025-10-16 15:08:24 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_78bdqgyvv59j


const compression = require('compression');


const configureSecurityMiddleware = require('./middleware/security');


const express = require('express');


const logger = require('./utils/logger');


const morgan = require('morgan');


const router = require('./routes/index');

const { apiLimiter } = require('./middleware/rateLimiter');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

/**
 * Initialize Express application
 */


const app = express();

/**
 * Trust proxy - required for rate limiting behind proxies
 */
app.set('trust proxy', 1);

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/**
 * Security middleware
 * Configures helmet, cors, hpp, mongo-sanitize
 */
configureSecurityMiddleware(app);

/**
 * Compression middleware
 */
app.use(compression());

/**
 * HTTP request logging
 * Using morgan with winston stream
 */


const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

/**
 * Rate limiting middleware
 * Apply to all API routes
 */
app.use('/api', apiLimiter);

/**
 * Health check endpoint
 */
app.get('/health', apiLimiter, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * API routes
 * Mount all routes under /api prefix
 */
app.use('/api', router);

/**
 * 404 handler
 * Must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 * Must be last middleware
 */
app.use(errorHandler);

/**
 * Export app instance
 * Server will call app.listen()
 */
module.exports = app;
