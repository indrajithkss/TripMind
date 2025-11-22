/**
 * Weather Service
 * Fetches weather data from OpenWeatherMap API
 */

const axios = require('axios');
const config = require('../config');

/**
 * Get weather forecast for a location and date range
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @param {Date} fromDate - Start date
 * @param {Date} toDate - End date
 * @returns {Promise<Object>} Weather forecast data
 */
const getWeatherForecast = async (latitude, longitude, fromDate, toDate) => {
  try {
    const apiKey = config.openWeatherApiKey;
    
    if (!apiKey) {
      console.warn('OpenWeatherMap API key not configured. Skipping weather data.');
      return null;
    }

    // OpenWeatherMap API endpoint for 5-day forecast
    // Note: Free tier provides 5-day forecast, for longer trips we'll use the closest available dates
    const url = `https://api.openweathermap.org/data/2.5/forecast`;
    
    const params = {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric', // Use Celsius
      cnt: 40 // Get 40 data points (5 days * 8 per day = 40, covers ~5 days)
    };

    const response = await axios.get(url, { params });
    
    if (!response.data || !response.data.list) {
      return null;
    }

    // Process forecast data to get daily summaries
    const forecastList = response.data.list;
    const dailyForecasts = {};
    
    // Group forecasts by date
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          date: dateKey,
          forecasts: [],
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          conditions: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyForecasts[dateKey].forecasts.push({
        time: date.toISOString(),
        temp: item.main.temp,
        feelsLike: item.main.feels_like,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        main: item.weather[0].main,
        icon: item.weather[0].icon,
        windSpeed: item.wind?.speed || 0,
        windDirection: item.wind?.deg || 0
      });
      
      // Update min/max temps
      if (item.main.temp_min < dailyForecasts[dateKey].tempMin) {
        dailyForecasts[dateKey].tempMin = item.main.temp_min;
      }
      if (item.main.temp_max > dailyForecasts[dateKey].tempMax) {
        dailyForecasts[dateKey].tempMax = item.main.temp_max;
      }
      
      dailyForecasts[dateKey].conditions.push(item.weather[0].main);
      dailyForecasts[dateKey].humidity.push(item.main.humidity);
      dailyForecasts[dateKey].windSpeed.push(item.wind?.speed || 0);
    });

    // Generate daily summaries
    const dailySummaries = Object.keys(dailyForecasts)
      .sort()
      .map(dateKey => {
        const day = dailyForecasts[dateKey];
        const uniqueConditions = [...new Set(day.conditions)];
        const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
        const avgWindSpeed = day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length;
        
        return {
          date: dateKey,
          tempMin: Math.round(day.tempMin),
          tempMax: Math.round(day.tempMax),
          condition: uniqueConditions[0] || 'Clear', // Primary condition
          description: day.forecasts[0]?.description || 'Clear sky',
          humidity: Math.round(avgHumidity),
          windSpeed: Math.round(avgWindSpeed * 3.6), // Convert m/s to km/h
          icon: day.forecasts[0]?.icon || '01d'
        };
      })
      .filter(day => {
        // Filter to only include days within the travel date range
        const dayDate = new Date(day.date);
        return dayDate >= fromDate && dayDate <= toDate;
      });

    return {
      location: {
        name: response.data.city?.name || 'Unknown',
        country: response.data.city?.country || 'Unknown',
        coordinates: { latitude, longitude }
      },
      dailyForecasts: dailySummaries,
      current: dailySummaries[0] || null
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    // Return null instead of throwing to allow trip plan generation to continue
    return null;
  }
};

/**
 * Format weather data for AI prompt
 * @param {Object} weatherData - Weather forecast data
 * @returns {string} Formatted weather string for prompt
 */
const formatWeatherForPrompt = (weatherData) => {
  if (!weatherData || !weatherData.dailyForecasts || weatherData.dailyForecasts.length === 0) {
    return 'Weather forecast not available for these dates.';
  }

  let weatherText = 'Weather Forecast:\n';
  weatherData.dailyForecasts.forEach(day => {
    const date = new Date(day.date);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    weatherText += `- ${dateStr}: ${day.tempMin}°C - ${day.tempMax}°C, ${day.description}, Humidity: ${day.humidity}%, Wind: ${day.windSpeed} km/h\n`;
  });

  return weatherText;
};

module.exports = {
  getWeatherForecast,
  formatWeatherForPrompt
};

