// File: src/controllers/bookController.js
// Generated: 2025-10-16 15:07:01 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_e2ov7qtywqfe


const ApiResponse = require('../utils/apiResponse');


const Book = require('../models/Book');


const logger = require('../utils/logger');


const mongoose = require('mongoose');

/**
 * Get all books with pagination
 * @route GET /api/books
 */


const getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [books, totalBooks] = await Promise.all([
      Book.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments()
    ]);

    const totalPages = Math.ceil(totalBooks / limit);

    logger.info('Fetched all books', {
      page,
      limit,
      totalBooks,
      count: books.length
    });

    res.status(200).json(
      ApiResponse.success({
        books,
        pagination: {
          totalBooks,
          currentPage: page,
          totalPages,
          limit
        }
      }, 'Books fetched successfully')
    );
  } catch (error) {
    logger.error('Failed to fetch books', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Get book by ID
 * @route GET /api/books/:id
 */


const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn('Invalid book ID format', { id });
      return res.status(400).json(
        ApiResponse.error('Invalid book ID format')
      );
    }

    const book = await Book.findById(id);

    if (!book) {
      logger.warn('Book not found', { id });
      return res.status(404).json(
        ApiResponse.error('Book not found')
      );
    }

    logger.info('Fetched book by ID', { bookId: id });

    res.status(200).json(
      ApiResponse.success(book, 'Book fetched successfully')
    );
  } catch (error) {
    logger.error('Failed to fetch book', {
      bookId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

/**
 * Create new book
 * @route POST /api/books
 */


const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, publishedDate } = req.body;

    if (!title || !author || !isbn || !publishedDate) {
      logger.warn('Missing required fields for book creation', {
        hasTitle: !!title,
        hasAuthor: !!author,
        hasIsbn: !!isbn,
        hasPublishedDate: !!publishedDate
      });
      return res.status(400).json(
        ApiResponse.error('Missing required fields: title, author, isbn, publishedDate')
      );
    }

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      logger.warn('Duplicate ISBN detected', { isbn });
      return res.status(400).json(
        ApiResponse.error('Book with this ISBN already exists')
      );
    }

    const book = new Book({
      title,
      author,
      isbn,
      publishedDate
    });

    await book.save();

    logger.info('Created new book', {
      bookId: book._id,
      isbn: book.isbn,
      title: book.title
    });

    res.status(201).json(
      ApiResponse.success(book, 'Book created successfully')
    );
  } catch (error) {
    logger.error('Failed to create book', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    next(error);
  }
};

/**
 * Update book
 * @route PUT /api/books/:id
 */


const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn('Invalid book ID format for update', { id });
      return res.status(400).json(
        ApiResponse.error('Invalid book ID format')
      );
    }

    if (req.body.isbn) {
      const existingBook = await Book.findOne({
        isbn: req.body.isbn,
        _id: { $ne: id }
      });

      if (existingBook) {
        logger.warn('Duplicate ISBN detected during update', {
          isbn: req.body.isbn,
          bookId: id
        });
        return res.status(400).json(
          ApiResponse.error('Book with this ISBN already exists')
        );
      }
    }

    const book = await Book.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      logger.warn('Book not found for update', { id });
      return res.status(404).json(
        ApiResponse.error('Book not found')
      );
    }

    logger.info('Updated book', {
      bookId: id,
      updatedFields: Object.keys(req.body)
    });

    res.status(200).json(
      ApiResponse.success(book, 'Book updated successfully')
    );
  } catch (error) {
    logger.error('Failed to update book', {
      bookId: req.params.id,
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    next(error);
  }
};

/**
 * Delete book
 * @route DELETE /api/books/:id
 */


const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.warn('Invalid book ID format for deletion', { id });
      return res.status(400).json(
        ApiResponse.error('Invalid book ID format')
      );
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      logger.warn('Book not found for deletion', { id });
      return res.status(404).json(
        ApiResponse.error('Book not found')
      );
    }

    logger.info('Deleted book', {
      bookId: id,
      title: book.title,
      isbn: book.isbn
    });

    res.status(200).json(
      ApiResponse.success(
        { message: 'Book deleted successfully' },
        'Book deleted successfully'
      )
    );
  } catch (error) {
    logger.error('Failed to delete book', {
      bookId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
