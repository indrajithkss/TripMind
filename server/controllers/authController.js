/**
 * Auth Controller
 * Business logic for authentication
 */

const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Sign up controller
 */
const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields (name, email, password)',
        error: 'Missing required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
        error: 'Email already registered'
      });
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(newUser._id.toString());

    // Return user data (password is automatically removed by toJSON method)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: newUser.toJSON(),
      data: {
        token,
        user: newUser.toJSON()
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', '),
        error: 'Validation error'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Sign in controller
 */
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        error: 'Missing required fields'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'User not found'
      });
    }

    // Check password using model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid password'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data (password is automatically removed by toJSON method)
    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token,
      user: user.toJSON(),
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  signUp,
  signIn,
};

