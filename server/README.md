# TripMind Server

Express.js backend server for TripMind application with a clean, scalable folder structure.

## Features

- User authentication (sign up, sign in)
- JWT token generation
- Password hashing with bcrypt
- CORS enabled for React Native client
- In-memory user storage (replace with database in production)
- Modular folder structure for easy expansion

## Project Structure

```
server/
├── config/          # Configuration files
│   └── index.js     # App configuration (port, JWT secret, etc.)
├── controllers/     # Business logic
│   └── authController.js  # Authentication controller
├── middleware/      # Custom middleware
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Global error handler
│   └── notFound.js        # 404 handler
├── models/          # Data models
│   └── User.js      # User model (in-memory storage)
├── routes/          # Route definitions
│   ├── index.js     # Main routes (combines all routes)
│   └── authRoutes.js      # Authentication routes
├── utils/           # Utility functions
│   ├── jwt.js       # JWT token utilities
│   └── password.js  # Password hashing utilities
├── server.js        # Server entry point
└── package.json     # Dependencies
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the server directory:
   ```
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```
   
   Note: The server will work without a `.env` file (using default values), but it's recommended to create one for production.

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/signin
Sign in with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sign in successful",
  "token": "jwt-token-here",
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Notes

- **In-memory storage**: Users are stored in memory and will be lost when the server restarts. Replace with a database (MongoDB, PostgreSQL, etc.) in production.
- **JWT Secret**: Change the JWT_SECRET in `.env` to a secure random string in production.
- **Password Security**: Passwords are hashed using bcrypt before storage.
- **CORS**: Currently allows all origins. Configure CORS properly for production.

## Adding New Routes

To add new routes, follow this structure:

1. **Create a controller** in `controllers/`:
   ```javascript
   // controllers/userController.js
   const getUser = (req, res) => {
     // Controller logic
   };
   module.exports = { getUser };
   ```

2. **Create routes** in `routes/`:
   ```javascript
   // routes/userRoutes.js
   const express = require('express');
   const router = express.Router();
   const userController = require('../controllers/userController');
   const { authenticate } = require('../middleware/auth');
   
   router.get('/profile', authenticate, userController.getUser);
   module.exports = router;
   ```

3. **Add routes to main routes file** in `routes/index.js`:
   ```javascript
   const userRoutes = require('./userRoutes');
   router.use('/users', userRoutes);
   ```

## Authentication Middleware

Use the `authenticate` middleware to protect routes:

```javascript
const { authenticate } = require('../middleware/auth');

router.get('/protected-route', authenticate, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

## Next Steps

1. Add database integration (MongoDB, PostgreSQL, etc.)
2. Add input validation (express-validator)
3. Add rate limiting
4. Add email verification
5. Add password reset functionality
6. Add error logging
7. Add environment-specific configurations
8. Add request validation middleware

