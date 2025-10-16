// File: src/validators/bookValidator.js
// Generated: 2025-10-16 15:04:33 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_j53zmx9xj9an


const { body, validationResult } = require('express-validator');

/**
 * Custom validator to check if ISBN is valid
 * Accepts ISBN-10 (10 digits) or ISBN-13 (13 digits)
 * Strips hyphens and spaces before validation
 * Validates checksum for both ISBN-10 and ISBN-13
 * @param {string} value - ISBN value to validate
 * @returns {boolean} - True if valid ISBN
 */


const isValidISBN = (value) => {
  // Strip hyphens and spaces
  const cleanedISBN = value.replace(/[-\s]/g, '');

  // Check if it's ISBN-10
  if (/^\d{10}$/.test(cleanedISBN)) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const digit = cleanedISBN[i] === 'X' ? 10 : parseInt(cleanedISBN[i], 10);
      sum += digit * (10 - i);
    }
    return sum % 11 === 0;
  }

  // Check if it's ISBN-13
  if (/^\d{13}$/.test(cleanedISBN)) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      const digit = parseInt(cleanedISBN[i], 10);
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
  }

  return false;
};

/**
 * Custom validator to check if date is not in the future
 * @param {string} value - ISO8601 date string
 * @returns {boolean} - True if date is not in the future
 */


const isNotFutureDate = (value) => {
  const inputDate = new Date(value);

  // Check if date is valid
  if (isNaN(inputDate.getTime())) {
    return false;
  }

  const currentTimestamp = Date.now();
  return inputDate.getTime() <= currentTimestamp;
};

/**
 * Validation rules for creating a new book
 * All fields are required
 */


const validateBookCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),

  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Author must be between 1 and 200 characters'),

  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN is required')
    .custom(isValidISBN)
    .withMessage('ISBN must be valid ISBN-10 (10 digits) or ISBN-13 (13 digits)'),

  body('publishedDate')
    .notEmpty()
    .withMessage('Published date is required')
    .isISO8601()
    .withMessage('Published date must be in ISO8601 format')
    .custom(isNotFutureDate)
    .withMessage('Published date cannot be in the future')
];

/**
 * Validation rules for updating an existing book
 * All fields are optional but must be valid if provided
 */


const validateBookUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),

  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Author cannot be empty if provided')
    .isLength({ min: 1, max: 200 })
    .withMessage('Author must be between 1 and 200 characters'),

  body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ISBN cannot be empty if provided')
    .custom(isValidISBN)
    .withMessage('ISBN must be valid ISBN-10 (10 digits) or ISBN-13 (13 digits)'),

  body('publishedDate')
    .optional()
    .notEmpty()
    .withMessage('Published date cannot be empty if provided')
    .isISO8601()
    .withMessage('Published date must be in ISO8601 format')
    .custom(isNotFutureDate)
    .withMessage('Published date cannot be in the future')
];

module.exports = {
  validateBookCreation,
  validateBookUpdate
};
