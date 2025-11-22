/**
 * Main Routes
 * Combine all route modules
 */

const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const plannerRoutes = require('./plannerRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Planner routes
router.use('/planner', plannerRoutes);

module.exports = router;

