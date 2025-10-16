// File: src/utils/apiResponse.js
// Generated: 2025-10-16 15:04:53 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_d5v9qnz004lp

/**
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data (object, array, or null)
 * @param {Object|null} meta - Optional metadata (pagination, counts, etc.)
 */


const sendSuccess = (res, statusCode, message, data, meta = null) => {
  const response = {
    success: true,
    statusCode,
    message,
    data
  };

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a 201 Created response
 *
 /**
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message (default: 'Resource created successfully')
 */


const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Send a 200 OK response
 *
 /**
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message (default: 'Operation successful')
 */


const sendOk = (res, data, message = 'Operation successful') => {
  return sendSuccess(res, 200, message, data);
};

/**
 * Send a 204 No Content response
 *
 /**
 * @param {Object} res - Express response object
 */


const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send a standardized error response
 *
 /**
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object|null} errorDetails - Optional error details
 */


const sendError = (res, statusCode, message, errorDetails = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    error: errorDetails || {}
  };

  if (process.env.NODE_ENV === 'development' && errorDetails && errorDetails.stack) {
    response.stack = errorDetails.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a 400 Bad Request response
 *
 /**
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array|null} validationErrors - Optional validation errors
 */


const sendBadRequest = (res, message, validationErrors = null) => {
  const errorDetails = validationErrors ? { validationErrors } : null;
  return sendError(res, 400, message, errorDetails);
};

/**
 * Send a 404 Not Found response
 *
 /**
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 */


const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};

/**
 * Send a 500 Internal Server Error response
 *
 /**
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Internal server error')
 * @param {Error|null} error - Optional error object
 */


const sendServerError = (res, message = 'Internal server error', error = null) => {
  const errorDetails = error ? {
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  } : null;

  return sendError(res, 500, message, errorDetails);
};

/**
 * Send a 422 Unprocessable Entity response for validation errors
 *
 /**
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 */


const sendValidationError = (res, errors) => {
  const formattedErrors = formatValidationErrors(errors);
  return sendError(res, 422, 'Validation failed', { validationErrors: formattedErrors });
};

/**
 * Format validation errors from express-validator or Mongoose
 *
 * @param {Array|Object} errors - Validation errors in various formats
 * @returns {Array} Formatted array of { field, message } objects
 */


const formatValidationErrors = (errors) => {
  // Handle express-validator format (array with param/msg fields)
  if (Array.isArray(errors)) {
    return errors.map(err => ({
      field: err.param || err.path || 'unknown',
      message: err.msg || err.message || 'Validation error'
    }));
  }

  // Handle Mongoose validation errors (errors object with nested error objects)
  if (errors && typeof errors === 'object' && errors.errors) {
    return Object.keys(errors.errors).map(key => ({
      field: key,
      message: errors.errors[key].message || 'Validation error'
    }));
  }

  // Handle plain object with field: message pairs
  if (errors && typeof errors === 'object') {
    return Object.keys(errors).map(key => ({
      field: key,
      message: errors[key]
    }));
  }

  // Fallback for unknown format
  return [{ field: 'unknown', message: 'Validation error occurred' }];
};

class ApiResponse {
  static success(message, data) {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message, statusCode) {
    return {
      success: false,
      message,
      statusCode
    };
  }

  static sendSuccess(res, statusCode, message, data, meta = null) {
    return sendSuccess(res, statusCode, message, data, meta);
  }

  static sendCreated(res, data, message = 'Resource created successfully') {
    return sendCreated(res, data, message);
  }

  static sendOk(res, data, message = 'Operation successful') {
    return sendOk(res, data, message);
  }

  static sendNoContent(res) {
    return sendNoContent(res);
  }

  static sendError(res, statusCode, message, errorDetails = null) {
    return sendError(res, statusCode, message, errorDetails);
  }

  static sendBadRequest(res, message, validationErrors = null) {
    return sendBadRequest(res, message, validationErrors);
  }

  static sendNotFound(res, message = 'Resource not found') {
    return sendNotFound(res, message);
  }

  static sendServerError(res, message = 'Internal server error', error = null) {
    return sendServerError(res, message, error);
  }

  static sendValidationError(res, errors) {
    return sendValidationError(res, errors);
  }

  static formatValidationErrors(errors) {
    return formatValidationErrors(errors);
  }
}

module.exports = ApiResponse;
