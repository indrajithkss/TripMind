/**
 * Planner Service
 * API calls for trip planner functionality
 */

import { getToken } from '@/utils/tokenStorage';

// API Base URL Configuration:
// - For Android Emulator: use 'http://10.0.2.2:3000/api'
// - For iOS Simulator: use 'http://localhost:3000/api'
// - For Physical Device (Expo): use your computer's local IP address
//   Find your IP: Windows: ipconfig | Mac/Linux: ifconfig
//   Look for IPv4 Address under your WiFi adapter (usually 192.168.x.x)
//   Make sure your phone and computer are on the same WiFi network

// Your computer's IP addresses found:
// - 192.168.1.5 (Main WiFi network - use this for physical device)
// - 172.28.80.1 (Virtual adapter - may work if using WSL/Docker)

const API_BASE_URL = 'http://172.20.10.4:3000/api'; // Change this to match your network IP

export interface PlannerData {
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city?: string;
    region?: string;
    country?: string;
  };
  travelDates: {
    fromDate: string; // ISO string
    toDate: string; // ISO string
  };
  groupSize: string;
  budgetRange: string;
  accommodationPreference: string;
  travelStyles: string[];
}

export interface PlannerResponse {
  success: boolean;
  message?: string;
  data?: any; // Can be an object (for single trip plan) or array (for multiple trip plans)
  error?: string;
  tripPlan?: any; // AI-generated trip plan
  aiSuccess?: boolean; // Whether AI generation was successful
}

/**
 * Create trip plan
 */
export const createTripPlan = async (data: PlannerData): Promise<PlannerResponse> => {
  try {
    // Get authentication token
    const token = await getToken();
    
    console.log('Token retrieved:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('No authentication token found. User needs to sign in.');
      return {
        success: false,
        error: 'Authentication required',
        message: 'Please sign in to create a trip plan',
      };
    }

    console.log('Sending trip plan data to API:', data);
    console.log('API URL:', `${API_BASE_URL}/planner/create`);
    console.log('Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    
    const response = await fetch(`${API_BASE_URL}/planner/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'Your session has expired. Please sign in again.',
        };
      }
      
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
// console.log('Result:', result);
    return {
      success: true,
      data: result.data,
      tripPlan: result.tripPlan,
      aiSuccess: result.aiSuccess,
      message: result.message || 'Trip plan created successfully',
    };
  } catch (error) {
    console.error('Error creating trip plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    // Provide helpful error messages
    let userMessage = 'Unable to connect to server.';
    if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      userMessage = `Cannot connect to server at ${API_BASE_URL}. Please ensure:\n1. Server is running\n2. Correct IP address is configured\n3. Device and server are on the same network`;
    }
    
    return {
      success: false,
      error: errorMessage,
      message: userMessage,
    };
  }
};

/**
 * Get all trip plans for the authenticated user
 */
export const getMyTripPlans = async (): Promise<PlannerResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'Please sign in to view your trip plans',
      };
    }

    const response = await fetch(`${API_BASE_URL}/planner/my-plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'Your session has expired. Please sign in again.',
        };
      }
      
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: result.message || 'Trip plans retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching trip plans:', error);
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    return {
      success: false,
      error: errorMessage,
      message: 'Unable to fetch trip plans',
    };
  }
};

/**
 * Get a single trip plan by ID
 */
export const getTripPlanById = async (id: string): Promise<PlannerResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
        message: 'Please sign in to view trip plans',
      };
    }

    const response = await fetch(`${API_BASE_URL}/planner/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          message: 'Your session has expired. Please sign in again.',
        };
      }
      
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      tripPlan: result.data?.tripPlan,
      message: result.message || 'Trip plan retrieved successfully',
    };
  } catch (error) {
    console.error('Error fetching trip plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    
    return {
      success: false,
      error: errorMessage,
      message: 'Unable to fetch trip plan',
    };
  }
};

