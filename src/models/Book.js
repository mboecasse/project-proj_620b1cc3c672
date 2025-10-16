// File: src/models/Book.js
// Generated: 2025-10-16 15:04:36 UTC
// Project ID: proj_620b1cc3c672
// Task ID: task_lhu3zurv3xtz


const mongoose = require('mongoose');

/**
 * Book Schema
 * Represents a book in the library with title, author, isbn, and publication date
 */


const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character long'],
      maxlength: [500, 'Title cannot exceed 500 characters'],
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Title cannot be empty or only whitespace'
      }
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [1, 'Author name must be at least 1 character long'],
      maxlength: [200, 'Author name cannot exceed 200 characters'],
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: 'Author name cannot be empty or only whitespace'
      }
    },
    isbn: {
      type: String,
      required: [true, 'isbn is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          const normalized = v.replace(/[-\s]/g, '').toUpperCase();
          return /^(\d{10}|\d{13})$/.test(normalized);
        },
        message: 'isbn must be a valid 10 or 13 digit number'
      }
    },
    publishedDate: {
      type: Date,
      required: [true, 'Published date is required'],
      validate: {
        validator: function(v) {
          return v <= new Date();
        },
        message: 'Published date cannot be in the future'
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Pre-save hook to normalize isbn
 * Removes hyphens and spaces, converts to uppercase
 */
BookSchema.pre('save', function(next) {
  if (this.isModified('isbn')) {
    this.isbn = this.isbn.replace(/[-\s]/g, '').toUpperCase();
  }
  next();
});

/**
 * Indexes for performance optimization
 */
BookSchema.index({ title: 1, author: 1 });

module.exports = mongoose.model('Book', BookSchema);
