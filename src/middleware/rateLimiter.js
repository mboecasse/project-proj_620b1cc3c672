// File: src/middleware/rateLimiter.js
// Generated: 2025-10-16 15:06:27 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_cimu6tut19x2


const logger = require('../utils/logger');


const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter Configuration
 * Prevents API abuse by limiting request frequency
 */

// Environment variables with defaults - with radix and NaN validation


const parseEnvInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};


const RATE_LIMIT_WINDOW_MS = parseEnvInt(process.env.RATE_LIMIT_WINDOW_MS, 900000); // 15 minutes


const RATE_LIMIT_MAX_REQUESTS = parseEnvInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100);


const RATE_LIMIT_WRITE_MAX = parseEnvInt(process.env.RATE_LIMIT_WRITE_MAX, 20);


const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

/**
 * Get client IP with proper validation
 * Handles X-Forwarded-For with validation when proxy is trusted
 */


const getClientIp = (req) => {
  if (TRUST_PROXY) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Get first IP from X-Forwarded-For chain
      const ips = forwardedFor.split(',').map(ip => ip.trim());
      return ips[0];
    }
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Generate rate limit key based on IP and optionally user/API key
 */


const generateRateLimitKey = (req) => {
  const ip = getClientIp(req);

  // If authenticated, combine with user identifier for more accurate limiting
  if (req.user && req.user.id) {
    return `user:${req.user.id}:${ip}`;
  }

  // If API key is present, use it for rate limiting
  if (req.headers['x-api-key']) {
    return `apikey:${req.headers['x-api-key']}:${ip}`;
  }

  return `ip:${ip}`;
};

/**
 * Skip rate limiting for health check endpoints
 */


const skipHealthChecks = (req) => {
  const path = req.path;
  return path === '/health' || path === '/status';
};

/**
 * General API rate limiter
 * Applies to all API endpoints
 * 100 requests per 15 minutes by default
 */


const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipHealthChecks,
  keyGenerator: generateRateLimitKey,
  handler: (req, res) => {
    const ip = getClientIp(req);
    logger.warn('Rate limit exceeded', {
      ip: ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      apiKey: req.headers['x-api-key'] ? 'present' : 'none'
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    });
  },
  onLimitReached: (req) => {
    const ip = getClientIp(req);
    logger.info('Rate limit reached', {
      ip: ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });
  }
});

/**
 * Strict rate limiter for write operations
 * Applies to POST, PUT, DELETE requests
 * 20 requests per 15 minutes by default
 */


const writeLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_WRITE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipHealthChecks,
  keyGenerator: generateRateLimitKey,
  handler: (req, res) => {
    const ip = getClientIp(req);
    logger.warn('Write rate limit exceeded', {
      ip: ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      apiKey: req.headers['x-api-key'] ? 'present' : 'none'
    });

    res.status(429).json({
      success: false,
      error: 'Too many write requests, please try again later',
      retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)
    });
  },
  onLimitReached: (req) => {
    const ip = getClientIp(req);
    logger.info('Write rate limit reached', {
      ip: ip,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });
  }
});

/**
 * Factory function to create custom rate limiters
 * @param {Object} options - Rate limiter configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Custom error message
 * @param {boolean} options.useAuthKey - Whether to use authentication-based keys
 * @returns {Function} Express middleware function
 */


const createRateLimiter = (options = {}) => {
  const {
    windowMs = RATE_LIMIT_WINDOW_MS,
    max = RATE_LIMIT_MAX_REQUESTS,
    message = 'Too many requests, please try again later',
    useAuthKey = true
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: skipHealthChecks,
    keyGenerator: useAuthKey ? generateRateLimitKey : (req) => `ip:${getClientIp(req)}`,
    handler: (req, res) => {
      const ip = getClientIp(req);
      logger.warn('Custom rate limit exceeded', {
        ip: ip,
        path: req.path,
        method: req.method,
        limit: max,
        window: windowMs,
        userId: req.user?.id
      });

      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    onLimitReached: (req) => {
      const ip = getClientIp(req);
      logger.info('Custom rate limit reached', {
        ip: ip,
        path: req.path,
        method: req.method,
        limit: max,
        userId: req.user?.id
      });
    }
  });
};

module.exports = {
  apiLimiter,
  writeLimiter,
  createRateLimiter
};
