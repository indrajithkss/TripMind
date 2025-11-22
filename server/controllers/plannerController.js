/**
 * Planner Controller
 * Handles trip planner related requests
 */

const TripPlan = require('../models/TripPlan');
const { generateTripPlan } = require('../utils/gemini');

/**
 * Create/Save Trip Plan
 * POST /api/planner/create
 * Requires authentication (userId from req.userId)
 */
const createTripPlan = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const plannerData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      });
    }

    // Generate AI trip plan (OpenAI will provide weather information)
    let aiResponse = null;
    
    try {
      aiResponse = await generateTripPlan(plannerData);
      console.log('========================================');
      console.log('OPENAI API RESPONSE:');
      console.log('========================================');
      console.log('Success:', aiResponse.success);
      if (aiResponse.tripPlan) {
        console.log('Trip Plan:', JSON.stringify(aiResponse.tripPlan, null, 2));
      }
      console.log('========================================');
    } catch (aiError) {
      console.error('Error calling OpenAI API:', aiError);
      // Continue even if OpenAI fails - we'll still return the received data
      aiResponse = {
        success: false,
        error: aiError.message
      };
    }

    // Parse dates
    const fromDate = plannerData.travelDates?.fromDate ? new Date(plannerData.travelDates.fromDate) : null;
    const toDate = plannerData.travelDates?.toDate ? new Date(plannerData.travelDates.toDate) : null;

    // Save trip plan to MongoDB
    const tripPlan = await TripPlan.create({
      userId,
      startingLocation: plannerData.startingLocation || null,
      location: plannerData.location,
      travelDates: {
        fromDate,
        toDate,
      },
      groupSize: plannerData.groupSize,
      budgetRange: plannerData.budgetRange,
      accommodationPreference: plannerData.accommodationPreference,
      travelStyles: plannerData.travelStyles || [],
      tripPlan: aiResponse?.tripPlan || null,
      aiSuccess: aiResponse?.success || false,
    });

    // Return response with saved trip plan
    res.status(201).json({
      success: true,
      message: 'Trip plan created and saved successfully',
      data: {
        id: tripPlan._id,
        location: tripPlan.location,
        travelDates: tripPlan.travelDates,
        groupSize: tripPlan.groupSize,
        budgetRange: tripPlan.budgetRange,
        accommodationPreference: tripPlan.accommodationPreference,
        travelStyles: tripPlan.travelStyles,
      },
      tripPlan: tripPlan.tripPlan,
      aiSuccess: tripPlan.aiSuccess,
      createdAt: tripPlan.createdAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating trip plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip plan',
      error: error.message
    });
  }
};

/**
 * Get all trip plans for authenticated user
 * GET /api/planner/my-plans
 * Requires authentication
 */
const getMyTripPlans = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      });
    }

    // Fetch all trip plans for the user, sorted by creation date (newest first)
    const tripPlans = await TripPlan.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    res.status(200).json({
      success: true,
      message: 'Trip plans retrieved successfully',
      count: tripPlans.length,
      data: tripPlans
    });
  } catch (error) {
    console.error('Error fetching trip plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip plans',
      error: error.message
    });
  }
};

/**
 * Get a single trip plan by ID
 * GET /api/planner/:id
 * Requires authentication
 */
const getTripPlanById = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      });
    }

    // Find trip plan and verify it belongs to the user
    const tripPlan = await TripPlan.findOne({ _id: id, userId });

    if (!tripPlan) {
      return res.status(404).json({
        success: false,
        message: 'Trip plan not found',
        error: 'Not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trip plan retrieved successfully',
      data: tripPlan
    });
  } catch (error) {
    console.error('Error fetching trip plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip plan',
      error: error.message
    });
  }
};

module.exports = {
  createTripPlan,
  getMyTripPlans,
  getTripPlanById,
};

