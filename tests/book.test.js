// File: tests/book.test.js
// Generated: 2025-10-16 15:11:21 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_o7y869lim0vx


const Book = require('../src/models/Book');


const app = require('../src/app');


const mongoose = require('mongoose');


const request = require('supertest');

const { MongoMemoryServer } = require('mongodb-memory-server');


let mongoServer;

// Set Jest timeout for async operations
jest.setTimeout(10000);

/**
 * Setup - Start MongoMemoryServer and connect mongoose
 */
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

/**
 * Teardown - Disconnect mongoose and stop MongoMemoryServer
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Clear Book collection after each test for isolation
 */
afterEach(async () => {
  await Book.deleteMany({});
});

/**
 * Helper function to create test book data
 */


const createTestBook = (overrides = {}) => ({
  title: 'Test Book',
  author: 'Test Author',
  ISBN: '1234567890',
  publishedDate: new Date('2023-01-01'),
  ...overrides
});

describe('Book API Integration Tests', () => {
  describe('GET /api/books', () => {
    it('should return empty array when no books exist', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
    });

    it('should return all books when books exist', async () => {
      // Arrange
      const book1 = await Book.create(createTestBook({ ISBN: '1111111111' }));
      const book2 = await Book.create(createTestBook({
        title: 'Another Book',
        ISBN: '2222222222'
      }));

      // Act
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('title');
      expect(response.body.data[0]).toHaveProperty('author');
      expect(response.body.data[0]).toHaveProperty('ISBN');
      expect(response.body.data[0]).toHaveProperty('publishedDate');
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return specific book by valid ID', async () => {
      // Arrange
      const book = await Book.create(createTestBook());

      // Act
      const response = await request(app)
        .get(`/api/books/${book._id}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', book.title);
      expect(response.body.data).toHaveProperty('author', book.author);
      expect(response.body.data).toHaveProperty('ISBN', book.ISBN);
      expect(response.body.data._id).toBe(book._id.toString());
    });

    it('should return 404 for non-existent valid ObjectId', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(app)
        .get(`/api/books/${nonExistentId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ObjectId format', async () => {
      // Act
      const response = await request(app)
        .get('/api/books/invalid-id-format')
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/books', () => {
    it('should create book with valid data', async () => {
      // Arrange
      const bookData = createTestBook();

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data).toHaveProperty('title', bookData.title);
      expect(response.body.data).toHaveProperty('author', bookData.author);
      expect(response.body.data).toHaveProperty('ISBN', bookData.ISBN);

      // Verify book was saved to database
      const savedBook = await Book.findById(response.body.data._id);
      expect(savedBook).not.toBeNull();
      expect(savedBook.title).toBe(bookData.title);
    });

    it('should return 400 when title is missing', async () => {
      // Arrange
      const bookData = createTestBook();
      delete bookData.title;

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when author is missing', async () => {
      // Arrange
      const bookData = createTestBook();
      delete bookData.author;

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when ISBN is missing', async () => {
      // Arrange
      const bookData = createTestBook();
      delete bookData.ISBN;

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when publishedDate is missing', async () => {
      // Arrange
      const bookData = createTestBook();
      delete bookData.publishedDate;

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate ISBN', async () => {
      // Arrange
      const bookData = createTestBook();
      await Book.create(bookData);

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate ISBN format', async () => {
      // Arrange
      const bookData = createTestBook({ ISBN: '123' }); // Too short

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate publishedDate format', async () => {
      // Arrange
      const bookData = createTestBook({ publishedDate: 'invalid-date' });

      // Act
      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/books/:id', () => {
    it('should update existing book', async () => {
      // Arrange
      const book = await Book.create(createTestBook());
      const updates = {
        title: 'Updated Title',
        author: 'Updated Author'
      };

      // Act
      const response = await request(app)
        .put(`/api/books/${book._id}`)
        .send(updates)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', updates.title);
      expect(response.body.data).toHaveProperty('author', updates.author);

      // Verify book was updated in database
      const updatedBook = await Book.findById(book._id);
      expect(updatedBook.title).toBe(updates.title);
      expect(updatedBook.author).toBe(updates.author);
    });

    it('should return 404 for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId();
      const updates = { title: 'Updated Title' };

      // Act
      const response = await request(app)
        .put(`/api/books/${nonExistentId}`)
        .send(updates)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate updated data', async () => {
      // Arrange
      const book = await Book.create(createTestBook());
      const invalidUpdates = { ISBN: '123' }; // Too short

      // Act
      const response = await request(app)
        .put(`/api/books/${book._id}`)
        .send(invalidUpdates)
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should prevent duplicate ISBN on update', async () => {
      // Arrange
      const book1 = await Book.create(createTestBook({ ISBN: '1111111111' }));
      const book2 = await Book.create(createTestBook({ ISBN: '2222222222' }));

      // Act - Try to update book2 with book1's ISBN
      const response = await request(app)
        .put(`/api/books/${book2._id}`)
        .send({ ISBN: '1111111111' })
        .expect(400);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete book successfully', async () => {
      // Arrange
      const book = await Book.create(createTestBook());

      // Act
      const response = await request(app)
        .delete(`/api/books/${book._id}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');

      // Verify book was removed from database
      const deletedBook = await Book.findById(book._id);
      expect(deletedBook).toBeNull();
    });

    it('should return 404 for non-existent ID', async () => {
      // Arrange
      const nonExistentId = new mongoose.Types.ObjectId();

      // Act
      const response = await request(app)
        .delete(`/api/books/${nonExistentId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should verify book is removed from database', async () => {
      // Arrange
      const book = await Book.create(createTestBook());

      // Act
      await request(app)
        .delete(`/api/books/${book._id}`)
        .expect(200);

      // Assert
      const deletedBook = await Book.findById(book._id);
      expect(deletedBook).toBeNull();

      // Verify count is 0
      const count = await Book.countDocuments();
      expect(count).toBe(0);
    });
  });
});

module.exports = {};
