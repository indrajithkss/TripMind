/**
 * OpenAI AI Service
 * Handles interactions with OpenAI API for trip planning
 */

const OpenAI = require('openai');
const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openaiApiKey || config.geminiApiKey, // Support both for backward compatibility
});

/**
 * Sleep/delay utility for retry logic
 * @param {number} ms - Milliseconds to wait
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate trip plan using OpenAI API with retry logic
 * @param {Object} plannerData - The trip planner data from frontend
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object>} - Generated trip plan response
 */
const generateTripPlan = async (plannerData, maxRetries = 3) => {
  if (!config.openaiApiKey && !config.geminiApiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  // Available OpenAI models (in order of preference):
  // - gpt-4o: Latest and most capable (recommended)
  // - gpt-4-turbo: Fast and capable
  // - gpt-3.5-turbo: Fast and cost-effective
  const modelNames = ['gpt-4.1-mini'];
  let currentModelIndex = 0;

  // Retry logic wrapper
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Get the model name (try different models if one fails)
      const modelName = modelNames[currentModelIndex];

      console.log(`Using model: ${modelName}`);

      // Format dates for better readability
      const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      // Build the system prompt
      const systemPrompt = `You are an expert travel planner AI assistant. Based on the trip preferences provided, create a detailed and personalized trip plan.

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.

Please provide a comprehensive trip plan that includes:
1. A brief overview of the destination
2. Day-by-day itinerary suggestions that consider the typical weather conditions for each day based on the location and travel dates
3. Weather information for each day (typical temperature range, conditions like sunny/rainy/cloudy, and any seasonal considerations)
4. Weather-appropriate activities and clothing recommendations based on the expected weather
5. Specific hotel/accommodation recommendations (name, location, and why it's suitable) matching their preference and budget
6. Dining suggestions
7. Transportation tips
8. Budget breakdown and cost estimates
9. Important tips and things to know, including weather-related tips

IMPORTANT: 
- ALL BUDGETS MUST BE IN INDIAN RUPEE (INR/₹). All prices, costs, and budget breakdowns should be specified in Indian Rupees (₹).
- For weather information, use your knowledge of typical weather patterns for the destination location and time of year. Include realistic weather conditions for each day of the trip.
- For accommodations, provide specific hotel names, locations, and brief descriptions. Include at least 3-5 hotel recommendations that match their accommodation preference (Budget, Standard, Luxury, or Resort/Villa) and budget range.
- BUDGET FEASIBILITY: If the requested budget is not feasible for the destination, accommodation preference, and travel dates, set "budgetFeasible" to false and provide "expectedBudget" with a realistic budget range in INR. If the budget is feasible, set "budgetFeasible" to true and "expectedBudget" can be null or the same as the requested budget.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just pure JSON):
{
  "overview": "Brief overview of the destination and trip",
  "itinerary": [
    {
      "day": 1,
      "date": "formatted date string",
      "weather": "weather condition for this day (e.g., 'Sunny, 25-30°C' or 'Partly cloudy, 18-22°C with light rain expected')",
      "activities": ["activity 1", "activity 2"],
      "meals": {
        "breakfast": "suggestion",
        "lunch": "suggestion",
        "dinner": "suggestion"
      },
      "accommodation": "suggestion for the day"
    }
  ],
  "recommendations": {
    "accommodations": [
      {
        "name": "Hotel Name",
        "location": "Address or area",
        "type": "Budget/Standard/Luxury/Resort",
        "description": "Why this hotel is recommended",
        "estimatedPrice": "price range"
      }
    ],
    "restaurants": ["restaurant 1", "restaurant 2"],
    "activities": ["activity 1", "activity 2"]
  },
  "budgetBreakdown": {
    "flights": "estimated flight cost from starting location to destination in INR (₹)",
    "accommodation": "estimated cost in INR (₹)",
    "food": "estimated cost in INR (₹)",
    "activities": "estimated cost in INR (₹)",
    "transportation": "estimated local transportation cost in INR (₹)",
    "total": "total estimated cost including flights in INR (₹)"
  },
  "budgetFeasible": true,
  "expectedBudget": "realistic budget range in INR if not feasible, e.g., '₹50,000 - ₹75,000' or null if feasible",
  "tips": ["tip 1", "tip 2"],
  "weatherTips": ["weather-related tip 1", "weather-related tip 2"]
}

Make sure the plan is realistic, practical, and tailored to their preferences, budget, and expected weather conditions for the location and time of year. Consider typical weather patterns when suggesting activities - for example, suggest indoor activities for days with expected rain, or early morning activities for hot days. Return ONLY the JSON object, nothing else.`;

      // Format the trip data for the prompt
      const startingLocationText = plannerData.startingLocation 
        ? `Starting Location: ${plannerData.startingLocation.address || 'Not specified'}${plannerData.startingLocation.city ? `, ${plannerData.startingLocation.city}` : ''}${plannerData.startingLocation.country ? `, ${plannerData.startingLocation.country}` : ''}`
        : 'Starting Location: Not specified';
      
      const tripDataText = `Trip Details:
${startingLocationText}
- Destination: ${plannerData.location?.address || 'Not specified'}
- Destination Coordinates: ${plannerData.location?.latitude || 'N/A'}, ${plannerData.location?.longitude || 'N/A'}
- Destination City: ${plannerData.location?.city || 'Not specified'}
- Destination Region: ${plannerData.location?.region || 'Not specified'}
- Destination Country: ${plannerData.location?.country || 'Not specified'}

Travel Dates:
- From: ${formatDate(plannerData.travelDates?.fromDate)}
- To: ${formatDate(plannerData.travelDates?.toDate)}

Group Information:
- Group Size: ${plannerData.groupSize || 'Not specified'}

Budget & Preferences:
- Budget Range: ${plannerData.budgetRange || 'Not specified'} (All amounts are in Indian Rupee - INR/₹)
- Accommodation Preference: ${plannerData.accommodationPreference || 'Not specified'}
- Travel Styles/Interests: ${plannerData.travelStyles?.join(', ') || 'Not specified'}

CRITICAL BUDGET REQUIREMENTS:
- ALL costs, prices, and budget estimates MUST be in Indian Rupee (INR/₹). Use ₹ symbol for all monetary values.
- IMPORTANT: Include flight charges from the starting location to the destination in the budget breakdown. Calculate realistic flight costs based on the distance and route between the starting location and destination.
- The budget breakdown MUST include a "flights" field with estimated flight costs in INR for the group size specified.
- If the requested budget range is not feasible for this destination with the selected accommodation preference and travel dates (including flight costs), set "budgetFeasible" to false and provide a realistic "expectedBudget" range in INR.
- Budget ranges: "under-10000" = Under ₹10,000, "10000-25000" = ₹10,000-₹25,000, "25000-50000" = ₹25,000-₹50,000, "50000-plus" = ₹50,000+
- If budget is not feasible, clearly state this in the overview and provide the expected budget range needed.

IMPORTANT: Based on the destination location and travel dates provided above, use your knowledge of typical weather patterns for that location and time of year to provide realistic weather information for each day. Consider seasonal variations, typical temperature ranges, and common weather conditions. Use this weather information to suggest weather-appropriate activities (e.g., indoor activities for rainy days, early morning activities for hot days) and provide relevant weather-related tips.`;

      // Combine prompt and data
      const fullPrompt = `${systemPrompt}\n\n${tripDataText}`;

      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: tripDataText
          }
        ],
        response_format: { type: 'json_object' }, // Request JSON response
        temperature: 0.7,
      });

      // Extract text from response
      const text = completion.choices[0]?.message?.content || '';

      if (!text) {
        throw new Error('No text content in OpenAI response');
      }

      console.log('OpenAI API Response received');
      console.log('Response length:', text.length);
      console.log('Raw response preview:', text.substring(0, 500));

      // Try to parse JSON from the response with multiple strategies
      let tripPlan = null;
      let parseError = null;

      // Strategy 1: Try direct JSON parse
      try {
        tripPlan = JSON.parse(text.trim());
        console.log('Successfully parsed JSON directly');
      } catch (e1) {
        parseError = e1;

        // Strategy 2: Extract JSON from markdown code blocks
        try {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            tripPlan = JSON.parse(jsonMatch[1].trim());
            console.log('Successfully parsed JSON from code block');
          }
        } catch (e2) {
          // Strategy 3: Try to find JSON object in the text
          try {
            const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
              tripPlan = JSON.parse(jsonObjectMatch[0]);
              console.log('Successfully parsed JSON object from text');
            }
          } catch (e3) {
            console.error('All JSON parsing strategies failed');
            console.error('Parse errors:', { e1: e1.message, e2: e2?.message, e3: e3?.message });
          }
        }
      }

      // Validate the parsed structure
      if (tripPlan) {
        // Ensure required fields exist
        if (!tripPlan.overview) tripPlan.overview = 'Trip overview';
        if (!tripPlan.itinerary) tripPlan.itinerary = [];
        if (!tripPlan.recommendations) tripPlan.recommendations = {};
        if (!tripPlan.budgetBreakdown) tripPlan.budgetBreakdown = {};
        if (!tripPlan.tips) tripPlan.tips = [];
        if (tripPlan.budgetFeasible === undefined) tripPlan.budgetFeasible = true;
        if (!tripPlan.expectedBudget && !tripPlan.budgetFeasible) {
          tripPlan.expectedBudget = 'Please contact for budget details';
        }

        console.log('Trip plan structure validated');
      } else {
        console.warn('Failed to parse JSON, creating fallback structure');
        tripPlan = {
          overview: 'Unable to generate structured plan. Please try again.',
          itinerary: [],
          recommendations: {
            accommodations: [],
            restaurants: [],
            activities: []
          },
          budgetBreakdown: {
            accommodation: 'N/A',
            food: 'N/A',
            activities: 'N/A',
            transportation: 'N/A',
            total: 'N/A'
          },
          tips: [],
          rawResponse: text.substring(0, 1000), // Limit raw response length
          parseError: parseError?.message || 'Unknown parsing error'
        };
      }

      return {
        success: true,
        tripPlan,
        rawResponse: text.substring(0, 500) // Include first 500 chars for debugging
      };
    } catch (error) {
      // Check if it's a retryable error
      // OpenAI error codes: 429 (rate limit), 500/502/503 (server errors), 408 (timeout)
      const status = error.status || error.statusCode || error.response?.status;
      const isRetryable = status === 429 || status === 500 || status === 502 || status === 503 || status === 408;

      // If current model failed and we have another model to try, switch models
      if (isRetryable && currentModelIndex < modelNames.length - 1) {
        currentModelIndex++;
        console.warn(`Model ${modelNames[currentModelIndex - 1]} failed. Switching to ${modelNames[currentModelIndex]}...`);
        continue; // Retry with different model immediately
      }

      if (isRetryable && attempt < maxRetries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
        console.warn(`Attempt ${attempt} failed with status ${status}. Retrying in ${delayMs}ms...`);
        console.error('Error:', error.message);
        await sleep(delayMs);
        continue; // Retry
      } else {
        // Not retryable or max retries reached
        console.error(`Error calling OpenAI API (Attempt ${attempt}/${maxRetries}):`, error);
        throw error;
      }
    }
  }

  // Should never reach here, but just in case
  throw new Error('Failed to generate trip plan after all retry attempts');
};

module.exports = {
  generateTripPlan
};

