// File: src/config/database.js
// Generated: 2025-10-16 15:04:31 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_l43tvcjwfxgb


const config = require('./env.js');


const logger = require('../utils/logger');


const mongoose = require('mongoose');

/**
 * Connection state tracking
 */

let isConnected = false;

let isConnecting = false;

let connectionRetries = 0;


const MAX_RETRIES = 5;


const RETRY_DELAY = 5000; // 5 seconds

let eventListenersRegistered = false;

/**
 * MongoDB connection options
 */


const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

/**
 * Register event listeners once
 */


const registerEventListeners = () => {
  if (eventListenersRegistered) {
    return;
  }

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', { error: error.message });
    isConnected = false;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
    isConnecting = false;

    // Attempt to reconnect
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      logger.info(`Attempting to reconnect (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(() => {
        connectDB().catch((error) => {
          logger.error('Reconnection attempt failed', { error: error.message });
        });
      }, RETRY_DELAY);
    } else {
      logger.error('Maximum reconnection attempts reached');
    }
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
    isConnected = true;
    isConnecting = false;
    connectionRetries = 0;
  });

  eventListenersRegistered = true;
};

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<void>}
 */


const connectDB = async () => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return;
  }

  if (isConnecting) {
    logger.info('Connection attempt already in progress');
    return;
  }

  isConnecting = true;

  try {
    const mongoUri = config.mongodb.uri || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined in configuration');
    }

    logger.info('Attempting to connect to MongoDB...', {
      uri: mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
    });

    await mongoose.connect(mongoUri, connectionOptions);

    isConnected = true;
    isConnecting = false;
    connectionRetries = 0;

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });

    // Register event listeners only once
    registerEventListeners();

  } catch (error) {
    isConnected = false;
    isConnecting = false;
    logger.error('Failed to connect to MongoDB', {
      error: error.message,
      retries: connectionRetries
    });

    // Retry connection
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(() => {
        connectDB().catch((error) => {
          logger.error('Connection retry failed', { error: error.message });
        });
      }, RETRY_DELAY);
    } else {
      logger.error('Maximum connection attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

/**
 * Close database connection gracefully
 * @returns {Promise<void>}
 */


const closeDB = async () => {
  try {
    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      isConnecting = false;
      logger.info('MongoDB connection closed gracefully');
    }
  } catch (error) {
    logger.error('Error closing MongoDB connection', { error: error.message });
    throw error;
  }
};

/**
 * Get connection status
 * @returns {Object} Connection status information
 */


const getConnectionStatus = () => {
  return {
    isConnected,
    isConnecting,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState]
  };
};

/**
 * Handle graceful shutdown
 */


const handleShutdown = async (signal) => {
  logger.info(`${signal} received. Closing MongoDB connection...`);
  await closeDB();
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = {
  connectDB,
  closeDB,
  getConnectionStatus
};
