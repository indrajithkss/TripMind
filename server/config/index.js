/**
 * Configuration file
 * Environment variables and app settings
 */

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY || 'ADD API KEY HERE',
  geminiApiKey: process.env.GEMINI_API_KEY || '', // Kept for backward compatibility
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tripmind',
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '', // OpenWeatherMap API key
};

