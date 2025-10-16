// File: src/config/env.js
// Generated: 2025-10-16 15:04:06 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_do665nqxu2sm

/**
 * Validates required environment variables
 */ and provides defaults
 */

// Load environment variables from .env file
require('dotenv').config();


const requiredEnvVars = ['MONGODB_URI'];

// Validate required environment variables exist and are not empty


const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName];
  return !value || value.trim() === '';
});

if (missingVars.length > 0) {
  console.error(`ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file');
  process.exit(1);
}

// Validate MONGODB_URI format


const mongoUri = process.env.MONGODB_URI.trim();


const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;

if (!mongoUriPattern.test(mongoUri)) {
  console.error(`ERROR: Invalid MONGODB_URI format: ${mongoUri}`);
  console.error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

// Validate NODE_ENV


const validEnvironments = ['development', 'production', 'test'];


const nodeEnv = process.env.NODE_ENV || 'development';

if (!validEnvironments.includes(nodeEnv)) {
  console.error(`ERROR: Invalid NODE_ENV value: ${nodeEnv}`);
  console.error(`Must be one of: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

// Validate PORT


const port = parseInt(process.env.PORT || '3000', 10);

if (isNaN(port) || port < 1024 || port > 65535) {
  console.error(`ERROR: Invalid PORT value: ${process.env.PORT}`);
  console.error('PORT must be a number between 1024 and 65535');
  process.exit(1);
}

// Export validated configuration
module.exports = {
  env: nodeEnv,
  port: port,
  mongodb: {
    uri: mongoUri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test'
};
