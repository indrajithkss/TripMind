/**
 * Auth Routes
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Sign up route
router.post('/signup', authController.signUp);

// Sign in route
router.post('/signin', authController.signIn);

module.exports = router;

