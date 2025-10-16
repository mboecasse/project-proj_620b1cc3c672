// File: src/middleware/validator.js
// Generated: 2025-10-16 15:09:04 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_5gwhczlyog1d


const ApiResponse = require('../utils/apiResponse');

const { validationResult } = require('express-validator');

/**
 * Validation middleware wrapper
 * Processes express-validator results and returns formatted errors
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */


const Validator = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Format errors for consistent response structure without exposing sensitive values
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg
      }));

      // Ensure ApiResponse.error exists and is callable
      if (typeof ApiResponse.error === 'function') {
        return ApiResponse.error(res, 'Validation failed', 400, formattedErrors);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors
        });
      }
    }

    next();
  } catch (error) {
    // Fallback error handling to prevent middleware crash
    console.error('Validation middleware error:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred during validation'
      });
    }
  }
};

module.exports = { Validator };
