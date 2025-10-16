// File: src/middleware/errorHandler.js
// Generated: 2025-10-16 15:07:01 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_ckubnx11me44


const ApiResponse = require('../utils/apiResponse');


const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and returns formatted JSON responses
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const errorHandler = (err, req, res, next) => {
  // Check if headers have already been sent
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists';
    logger.warn('Duplicate key error', {
      error: err.message,
      path: req.path,
      method: req.method
    });
  }

  // MongoDB CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    logger.warn('Cast error', {
      error: err.message,
      path: req.path,
      method: req.method
    });
  }

  // MongoDB ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = errors.join(', ');
    logger.warn('Validation error', {
      errors: errors,
      path: req.path,
      method: req.method
    });
  }

  // Log error based on status code
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      statusCode: statusCode
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      path: req.path,
      method: req.method,
      statusCode: statusCode
    });
  }

  // Build response object
  const response = {
    success: false,
    message: message
  };

  // Include only stack trace in development mode (no sensitive error object)
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler for undefined routes
 * Creates a 404 error and passes to error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */


const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFoundHandler };
