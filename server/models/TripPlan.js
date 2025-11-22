/**
 * TripPlan Model
 * Mongoose schema for Trip Plans
 */

const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  date: String,
  weather: String, // Weather condition for the day
  activities: [String],
  meals: {
    breakfast: String,
    lunch: String,
    dinner: String,
  },
  accommodation: String,
}, { _id: false });

const accommodationSchema = new mongoose.Schema({
  name: String,
  location: String,
  type: String,
  description: String,
  estimatedPrice: String,
}, { _id: false });

const tripPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster queries
  },
  // Original planner data
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    city: String,
    region: String,
    country: String,
  },
  travelDates: {
    fromDate: Date,
    toDate: Date,
  },
  groupSize: String,
  budgetRange: String,
  accommodationPreference: String,
  travelStyles: [String],
  // Weather data
  weather: {
    location: {
      name: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    dailyForecasts: [{
      date: String,
      tempMin: Number,
      tempMax: Number,
      condition: String,
      description: String,
      humidity: Number,
      windSpeed: Number,
      icon: String,
    }],
    current: {
      date: String,
      tempMin: Number,
      tempMax: Number,
      condition: String,
      description: String,
      humidity: Number,
      windSpeed: Number,
      icon: String,
    },
  },
  // AI-generated trip plan
  tripPlan: {
    overview: String,
    itinerary: [itineraryDaySchema],
    recommendations: {
      accommodations: [accommodationSchema], // Changed from [String] to [accommodationSchema]
      restaurants: [String],
      activities: [String],
    },
    budgetBreakdown: {
      flights: String, // Flight charges from starting location
      accommodation: String,
      food: String,
      activities: String,
      transportation: String,
      total: String,
    },
    budgetFeasible: {
      type: Boolean,
      default: true,
    },
    expectedBudget: String, // Expected budget range if not feasible
    tips: [String],
    weatherTips: [String], // Weather-related tips
  },
  aiSuccess: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Index for faster queries by userId
tripPlanSchema.index({ userId: 1, createdAt: -1 });

const TripPlan = mongoose.model('TripPlan', tripPlanSchema);

module.exports = TripPlan;

