// File: src/utils/logger.js
// Generated: 2025-10-16 15:04:40 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_gqu109tye521


const fs = require('fs');


const path = require('path');


const winston = require('winston');

/**
 * DO NOT use console.log
 */ anywhere - import and use this logger
 */

// Ensure logs directory exists


const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format for production (JSON)


const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define log format for development (colorized, human-readable)


const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Determine environment


const env = process.env.NODE_ENV || 'development';


const isProduction = env === 'production';


const isTest = env === 'test';

// Determine log level


const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : isTest ? 'error' : 'debug');

// Configure transports


const transports = [];

// Console transport (silenced in test environment)
if (!isTest) {
  transports.push(
    new winston.transports.Console({
      format: isProduction ? productionFormat : developmentFormat,
      level: logLevel
    })
  );
}

// File transport for all logs
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    level: logLevel
  })
);

// File transport for error logs only
transports.push(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    level: 'error'
  })
);

// Create logger instance


const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? productionFormat : developmentFormat,
  transports,
  exitOnError: false
});

/**
 * Sanitize URL by removing sensitive query parameters
 * @param {string} url - Original URL
 * @returns {string} - Sanitized URL
 */


const sanitizeUrl = (url) => {
  try {
    const urlObj = new URL(url, 'http://dummy.com');
    const sensitiveParams = ['token', 'password', 'api_key', 'apikey', 'secret', 'auth', 'authorization', 'key', 'access_token', 'refresh_token'];

    sensitiveParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.set(param, '[REDACTED]');
      }
    });

    return urlObj.pathname + urlObj.search;
  } catch (e) {
    return url.split('?')[0];
  }
};

/**
 * Get client IP from request with trusted proxy support
 * @param {Object} req - Express request object
 * @returns {string} - Client IP address
 */


const getClientIp = (req) => {
  // If trust proxy is enabled and X-Forwarded-For exists
  if (req.app && req.app.get('trust proxy')) {
    const forwarded = req.get('X-Forwarded-For');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
  }

  // Fallback to direct connection IP
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

/**
 * Log HTTP request details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in milliseconds
 */
logger.logRequest = (req, res, duration) => {
  const metadata = {
    method: req.method,
    url: sanitizeUrl(req.originalUrl || req.url),
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: getClientIp(req),
    userAgent: req.get('user-agent') || 'unknown'
  };

  if (res.statusCode >= 500) {
    logger.error('HTTP Request Error', metadata);
  } else if (res.statusCode >= 400) {
    logger.warn('HTTP Request Warning', metadata);
  } else {
    logger.info('HTTP Request', metadata);
  }
};

/**
 * Log database operation
 * @param {string} operation - Operation type (create, read, update, delete)
 * @param {string} collection - Collection/table name
 * @param {Object} details - Additional details about the operation
 */
logger.logDbOperation = (operation, collection, details = {}) => {
  logger.debug('Database Operation', {
    operation,
    collection,
    ...details
  });
};

// Stream for Morgan HTTP logger integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
