// File: tests/setup.js
// Generated: 2025-10-16 15:04:45 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_5zpko5icy8cj


const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');


let mongoServer;

let isConnected = false;

// Set test environment and timeout
jest.setTimeout(30000);
process.env.NODE_ENV = 'test';

/**
 * Setup test database before all tests
 */
beforeAll(async () => {
  let serverCreated = false;

  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    serverCreated = true;
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to test database
    await mongoose.connect(mongoUri);
    isConnected = true;

    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Failed to setup test database:', error);

    // Cleanup partial initialization
    if (isConnected) {
      try {
        await mongoose.connection.close();
      } catch (closeError) {
        console.error('Failed to close mongoose connection during cleanup:', closeError);
      }
    }

    if (serverCreated && mongoServer) {
      try {
        await mongoServer.stop();
      } catch (stopError) {
        console.error('Failed to stop mongo server during cleanup:', stopError);
      }
    }

    throw error;
  }
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  try {
    // Wait for connection to be ready
    if (isConnected && mongoose.connection.readyState === 1) {
      // Drop database
      if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
      }

      // Close mongoose connection
      await mongoose.connection.close();
    } else if (mongoose.connection.readyState !== 0) {
      // Force close if in any other state
      await mongoose.connection.close();
    }

    // Stop MongoDB memory server
    if (mongoServer) {
      await mongoServer.stop();
    }

    isConnected = false;
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    throw error;
  }
});

/**
 * Clear all collections after each test for isolation
 */
afterEach(async () => {
  try {
    // Check if connection is ready
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.warn('Mongoose connection not ready, skipping collection cleanup');
      return;
    }

    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Failed to clear collections:', error);
    throw error;
  }
});

/**
 * Create a test book object with default values
 * @param {Object} overrides - Properties to override defaults
 * @returns {Object} Test book object
 */


const createTestBook = (overrides = {}) => {
  const defaults = {
    title: 'Test Book',
    author: 'Test Author',
    isbn: '978-0-123456-78-9',
    publishedDate: new Date('2024-01-01')
  };

  return { ...defaults, ...overrides };
};

/**
 * Create multiple test book objects
 * @param {number} count - Number of books to create
 * @returns {Array} Array of test book objects
 */


const createTestBooks = (count = 3) => {
  const books = [];

  for (let i = 1; i <= count; i++) {
    books.push({
      title: `Test Book ${i}`,
      author: `Test Author ${i}`,
      isbn: `978-0-123456-${String(i).padStart(2, '0')}-${i}`,
      publishedDate: new Date(`2024-0${Math.min(i, 9)}-01`)
    });
  }

  return books;
};

/**
 * Clear a specific collection by name
 * @param {string} name - Collection name to clear
 */


const clearCollection = async (name) => {
  try {
    // Check if connection is ready
    if (!isConnected || mongoose.connection.readyState !== 1) {
      console.warn('Mongoose connection not ready, skipping collection cleanup');
      return;
    }

    const collection = mongoose.connection.collections[name];

    if (collection) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error(`Failed to clear collection ${name}:`, error);
    throw error;
  }
};

global.createTestBook = createTestBook;
global.createTestBooks = createTestBooks;
global.clearCollection = clearCollection;

module.exports = {
  createTestBook,
  createTestBooks,
  clearCollection
};
