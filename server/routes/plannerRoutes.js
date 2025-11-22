/**
 * Planner Routes
 * Routes for trip planner functionality
 */

const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { authenticate } = require('../middleware/auth');

// All planner routes require authentication
router.use(authenticate);

// Create trip plan (requires auth)
router.post('/create', plannerController.createTripPlan);

// IMPORTANT: Specific routes must come before parameterized routes
// Get all trip plans for authenticated user (requires auth)
router.get('/my-plans', plannerController.getMyTripPlans);

// Get a single trip plan by ID (requires auth)
// This must come after /my-plans to avoid route conflicts
router.get('/:id', plannerController.getTripPlanById);

module.exports = router;

