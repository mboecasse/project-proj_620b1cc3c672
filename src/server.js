// File: src/server.js
// Generated: 2025-10-16 15:09:55 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_70ya6ozj6vwi


const app = require('./app');


const config = require('./config/env');


const logger = require('./utils/logger');

const { connectDB, closeDB } = require('./config/database');


let server;

let isShuttingDown = false;


const activeConnections = new Set();


const SHUTDOWN_TIMEOUT = 30000; // 30 seconds

/**
 * Start the HTTP server
 */
async function startServer() {
  try {
    // Connect to database first
    await connectDB();
    logger.info('Database connection established successfully');

    // Start HTTP server after successful DB connection
    server = app.listen(config.port, () => {
      logger.info(`Server started successfully`, {
        port: config.port,
        environment: config.env,
        pid: process.pid
      });
    });

    // Track active connections
    server.on('connection', (connection) => {
      activeConnections.add(connection);
      connection.on('close', () => {
        activeConnections.delete(connection);
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use`, { error: error.message });
      } else {
        logger.error('Server error occurred', { error: error.message });
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal', { signal });
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} signal received, starting graceful shutdown`);

  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err.message });
            reject(err);
          } else {
            logger.info('HTTP server closed successfully');
            resolve();
          }
        });
      });

      // Wait for active connections to complete
      const connectionCheckInterval = setInterval(() => {
        logger.info(`Waiting for ${activeConnections.size} active connections to close`);
      }, 1000);

      while (activeConnections.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      clearInterval(connectionCheckInterval);
      logger.info('All active connections closed');
    }

    // Close database connections
    await closeDB();
    logger.info('Database connections closed successfully');

    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed successfully');
    process.exit(0);

  } catch (error) {
    clearTimeout(shutdownTimeout);
    logger.error('Error during graceful shutdown', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception detected', {
    error: error.message,
    stack: error.stack
  });
  await gracefulShutdown('uncaughtException');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', async (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
  await gracefulShutdown('unhandledRejection');
});

/**
 * Handle termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

module.exports = { startServer, gracefulShutdown };
