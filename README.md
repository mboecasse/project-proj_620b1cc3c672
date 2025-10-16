# 📚 Book Management REST API

A production-ready REST API for managing a book library with full CRUD operations. Built with Express.js and MongoDB, featuring comprehensive validation, security middleware, rate limiting, and structured error handling.

## ✨ Key Features

- **Complete CRUD Operations** - Create, read, update, and delete books
- **Input Validation** - Comprehensive validation with express-validator and Joi
- **Security Hardened** - Helmet, CORS, HPP, XSS protection, and NoSQL injection prevention
- **Rate Limiting** - Configurable API and write operation rate limits
- **Structured Logging** - Winston-based logging with file rotation
- **Error Handling** - Centralized error handling with detailed logging
- **Database Management** - MongoDB with Mongoose ODM and automatic reconnection
- **Testing Suite** - Jest integration tests with MongoDB Memory Server
- **Graceful Shutdown** - Proper cleanup of connections and resources
- **Production Ready** - Compression, security headers, and monitoring endpoints

---

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** >= 6.0 (local installation or MongoDB Atlas account)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mboecasse/project-proj_620b1cc3c672.git
cd project-proj_620b1cc3c672
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see Environment Variables section below).

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/your/data/directory
```

**Or use MongoDB Atlas** and update `MONGODB_URI` in `.env`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Application environment (`development`, `production`, `test`) |
| `PORT` | No | `3000` | Server port number (1024-65535) |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string (e.g., `mongodb://localhost:27017/bookstore`) |
| `LOG_LEVEL` | No | `debug` (dev) / `info` (prod) | Logging level (`error`, `warn`, `info`, `debug`) |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit time window in milliseconds (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Maximum requests per window for general API calls |
| `RATE_LIMIT_WRITE_MAX` | No | `20` | Maximum write operations per window |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `ALLOW_NO_ORIGIN` | No | `false` | Allow requests with no origin header (`true`/`false`) |
| `TRUST_PROXY` | No | `false` | Trust proxy headers for rate limiting (`true`/`false`) |
| `BODY_LIMIT` | No | `1mb` | Maximum request body size |
| `COMPRESSION_ENABLED` | No | `true` | Enable response compression |

### Example Configuration

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bookstore
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

---

## 🏃 How to Run

### Development Mode

Runs the server with auto-reload on file changes:

```bash
npm run dev
```

### Production Mode

Runs the optimized production server:

```bash
npm run start:prod
```

### Standard Start

Runs the server without auto-reload:

```bash
npm start
```

### Run Tests

Execute the complete test suite with coverage:

```bash
npm test
```

Watch mode for test development:

```bash
npm run test:watch
```

### Code Quality

Lint code:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

Format code with Prettier:

```bash
npm run format
```

Validate code (lint + test):

```bash
npm run validate
```

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health and database status | No |
| GET | `/api/health` | API health check | No |

### Books

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/books` | Get all books (paginated) | No |
| GET | `/api/books/:id` | Get book by ID | No |
| POST | `/api/books` | Create new book | No |
| PUT | `/api/books/:id` | Update book by ID | No |
| DELETE | `/api/books/:id` | Delete book by ID | No |

### Request/Response Examples

#### Get All Books

**Request:**
```bash
GET /api/books?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Books fetched successfully",
  "data": {
    "books": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "publishedDate": "1925-04-10T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "totalBooks": 1,
      "currentPage": 1,
      "totalPages": 1,
      "limit": 10
    }
  }
}
```

#### Create Book

**Request:**
```bash
POST /api/books
Content-Type: application/json

{
  "title": "1984",
  "author": "George Orwell",
  "isbn": "978-0-452-28423-4",
  "publishedDate": "1949-06-08"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "1984",
    "author": "George Orwell",
    "isbn": "9780452284234",
    "publishedDate": "1949-06-08T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Book

**Request:**
```bash
PUT /api/books/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "title": "Nineteen Eighty-Four"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Nineteen Eighty-Four",
    "author": "George Orwell",
    "isbn": "9780452284234",
    "publishedDate": "1949-06-08T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### Delete Book

**Request:**
```bash
DELETE /api/books/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {
    "message": "Book deleted successfully"
  }
}
```

### Validation Rules

#### Book Fields

- **title**: Required, 1-500 characters, cannot be empty/whitespace
- **author**: Required, 1-200 characters, cannot be empty/whitespace
- **isbn**: Required, valid ISBN-10 (10 digits) or ISBN-13 (13 digits), unique
- **publishedDate**: Required, valid ISO8601 date, cannot be in the future

---

## 🏗️ Architecture Overview

### Project Structure

```
.
├── src/
│   ├── app.js                      # Express application setup
│   ├── server.js                   # HTTP server startup and graceful shutdown
│   ├── config/
│   │   ├── database.js             # MongoDB connection with retry logic
│   │   └── env.js                  # Environment variable validation
│   ├── controllers/
│   │   └── bookController.js       # Book business logic and CRUD operations
│   ├── middleware/
│   │   ├── errorHandler.js         # Centralized error handling
│   │   ├── rateLimiter.js          # Rate limiting configuration
│   │   ├── security.js             # Security middleware (Helmet, CORS, HPP)
│   │   └── validator.js            # Request validation middleware
│   ├── models/
│   │   └── Book.js                 # Mongoose Book schema and model
│   ├── routes/
│   │   ├── index.js                # Route aggregator
│   │   ├── bookRoutes.js           # Book CRUD endpoints
│   │   └── healthRoutes.js         # Health check endpoint
│   ├── utils/
│   │   ├── apiResponse.js          # Standardized API response format
│   │   ├── logger.js               # Winston logger configuration
│   │   └── bookValidator.js        # Book field validation utilities
│   └── validators/                 # Express-validator validation rules
├── tests/
│   ├── setup.js                    # Jest test configuration and hooks
│   └── book.test.js                # Book API integration tests
├── logs/                           # Application logs (auto-generated)
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
├── jest.config.js                  # Jest testing configuration
├── package.json                    # Project dependencies and scripts
└── README.md                       # This file
```

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19
- **Database**: MongoDB 6+ with Mongoose ODM 8.7
- **Validation**: express-validator 7.0, Joi 17.11
- **Security**: Helmet, CORS, HPP, XSS-Clean, Mongo-Sanitize
- **Logging**: Winston 3.11 with file rotation
- **Testing**: Jest 29.7, Supertest 6.3, MongoDB Memory Server
- **Rate Limiting**: express-rate-limit 7.1
- **Code Quality**: ESLint, Prettier

### Data Flow

1. **Request** → Rate Limiter → Security Middleware → Body Parser
2. **Routing** → Route Handler → Validation Middleware
3. **Controller** → Business Logic → Database Operations
4. **Response** → Standardized JSON Format → Logging
5. **Error** → Error Handler → Formatted Error Response

### Security Layers

1. **Helmet** - Sets secure HTTP headers
2. **CORS** - Configurable cross-origin resource sharing
3. **HPP** - HTTP parameter pollution protection
4. **XSS-Clean** - Cross-site scripting protection
5. **Mongo-Sanitize** - NoSQL injection prevention
6. **Rate Limiting** - API abuse prevention
7. **Input Validation** - Comprehensive request validation

---

## 🐛 Common Issues & Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3001
```

### MongoDB Connection Failed

**Error:** `MongoServerError: Authentication failed`

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   mongosh
   ```
2. Check `MONGODB_URI` in `.env`:
   ```env
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/bookstore
   
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookstore
   ```
3. Ensure database user has proper permissions
4. Check firewall/network settings

### Environment Variables Not Loaded

**Error:** `Missing required environment variables: MONGODB_URI`

**Solutions:**
1. Ensure `.env` file exists in root directory
2. Verify `.env` file has correct format (no quotes needed):
   ```env
   MONGODB_URI=mongodb://localhost:27017/bookstore
   ```
3. Restart the server after changing `.env`

### Validation Errors

**Error:** `Validation failed: ISBN must be valid`

**Solutions:**
- ISBN must be 10 or 13 digits (hyphens/spaces are stripped)
- Valid formats:
  - ISBN-10: `0-123456-78-9` or `0123456789`
  - ISBN-13: `978-0-123456-78-9` or `9780123456789`
- Published date must be in ISO8601 format: `2024-01-15` or `2024-01-15T10:30:00Z`
- Published date cannot be in the future

### Rate Limit Exceeded

**Error:** `Too many requests, please try again later`

**Solutions:**
1. Wait for the rate limit window to reset (default: 15 minutes)
2. Adjust rate limits in `.env`:
   ```env
   RATE_LIMIT_MAX_REQUESTS=200
   RATE_LIMIT_WINDOW_MS=900000
   ```
3. Use authentication for higher limits (if implemented)

### Test Failures

**Error:** `Jest test timeout exceeded`

**Solutions:**
1. Increase Jest timeout in `jest.config.js`:
   ```javascript
   testTimeout: 20000
   ```
2. Ensure MongoDB Memory Server has sufficient resources
3. Check for unclosed database connections in tests

### Logs Directory Permission Denied

**Error:** `EACCES: permission denied, mkdir 'logs'`

**Solution:**
```bash
# Create logs directory with proper permissions
mkdir logs
chmod 755 logs
```

### Duplicate Key Error

**Error:** `Book with this ISBN already exists`

**Solution:**
- ISBN must be unique across all books
- Check if book already exists before creating
- Use PUT endpoint to update existing books

---

## 📝 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Genesis Platform

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO