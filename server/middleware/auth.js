/**
 * Authentication Middleware
 * Verify JWT token for protected routes
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authenticate user middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error: 'Unauthorized'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'Unauthorized'
      });
    }

    // Find user in MongoDB
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'Unauthorized'
      });
    }

    // Attach user to request (password is automatically removed by toJSON)
    req.user = user.toJSON();
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: 'Unauthorized'
    });
  }
};

module.exports = {
  authenticate,
};

