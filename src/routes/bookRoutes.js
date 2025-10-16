// File: src/routes/bookRoutes.js
// Generated: 2025-10-16 15:08:03 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_uug4x0vjybcj


const express = require('express');

const { Validator } = require('../middleware/validator');

const { body, param } = require('express-validator');

const { getBooks, getBookById, createBook, updateBook, deleteBook } = require('../controllers/bookController');


const router = express.Router();

/**
 * Simplified ISBN validation to prevent ReDoS attacks
 * Validates ISBN-10 and ISBN-13 formats with basic structure
 */


const isbnValidator = (value) => {
  // Remove hyphens and spaces
  const cleaned = value.replace(/[-\s]/g, '');

  // ISBN-10: 10 digits (last can be X)
  const isbn10Pattern = /^[0-9]{9}[0-9X]$/;
  // ISBN-13: 13 digits starting with 978 or 979
  const isbn13Pattern = /^(978|979)[0-9]{10}$/;

  if (isbn10Pattern.test(cleaned) || isbn13Pattern.test(cleaned)) {
    return true;
  }

  throw new Error('Invalid ISBN format');
};

/**
 * ID parameter validation
 */


const idValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('ID is required')
    .matches(/^[a-fA-F0-9]{24}$/)
    .withMessage('Invalid ID format')
];

/**
 * Validation rules for creating a book
 */


const createBookValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required')
    .custom(isbnValidator),
  body('publishedDate')
    .notEmpty()
    .withMessage('Published date is required')
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate()
];

/**
 * Validation rules for updating a book
 */


const updateBookValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('author')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Author must be between 1 and 100 characters'),
  body('isbn')
    .optional()
    .trim()
    .custom(isbnValidator),
  body('publishedDate')
    .optional()
    .isISO8601()
    .withMessage('Published date must be a valid date')
    .toDate()
];

/**
 * GET /
 * Get all books
 */
router.get('/', getBooks);

/**
 * GET /:id
 * Get book by ID
 */
router.get('/:id', idValidation, Validator, getBookById);

/**
 * POST /
 * Create new book
 */
router.post('/', createBookValidation, Validator, createBook);

/**
 * PUT /:id
 * Update book by ID
 */
router.put('/:id', idValidation, updateBookValidation, Validator, updateBook);

/**
 * DELETE /:id
 * Delete book by ID
 */
router.delete('/:id', idValidation, Validator, deleteBook);

module.exports = router;
