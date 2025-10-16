// File: src/middleware/security.js
// Generated: 2025-10-16 15:04:36 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_aaknodba8d09


const compression = require('compression');


const cors = require('cors');


const helmet = require('helmet');


const hpp = require('hpp');


const logger = require('../utils/logger');


const mongoSanitize = require('express-mongo-sanitize');

/**
 * Configure security middleware for the Express application
 * @param {Object} app - Express application instance
 */


const configureSecurityMiddleware = (app) => {
  // Helmet - Set secure HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  logger.info('Helmet security headers configured');

  // CORS - Configure cross-origin resource sharing
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  const allowNoOrigin = process.env.ALLOW_NO_ORIGIN === 'true';

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin only if explicitly configured
      if (!origin) {
        if (allowNoOrigin) {
          return callback(null, true);
        } else {
          logger.warn('CORS request blocked - no origin header', { origin });
          return callback(new Error('Not allowed by CORS'));
        }
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        logger.warn('CORS request blocked', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  logger.info('CORS configured', { allowedOrigins });

  // MongoDB sanitization - Prevent NoSQL injection
  app.use(
    mongoSanitize({
      replaceWith: '_',
      onSanitize: ({ req, key }) => {
        logger.warn('Request sanitized - potential NoSQL injection attempt', {
          key,
          path: req.path,
          ip: req.ip,
        });
      },
    })
  );

  logger.info('MongoDB sanitization enabled');

  // HPP - Protect against HTTP Parameter Pollution
  app.use(
    hpp({
      whitelist: ['title', 'author'],
    })
  );

  logger.info('HTTP Parameter Pollution protection enabled');

  // Compression - Compress response bodies
  app.use(
    compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    })
  );

  logger.info('Response compression enabled');

  // Log security middleware initialization
  if (process.env.NODE_ENV === 'production') {
    logger.info('Security middleware configured for production environment');
  } else {
    logger.info('Security middleware configured for development environment');
  }
};

module.exports = configureSecurityMiddleware;
