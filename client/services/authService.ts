/**
 * Authentication Service
 * API calls for sign in and sign up
 */

import { storeToken, removeToken } from '@/utils/tokenStorage';

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

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
}

/**
 * Sign in function
 */
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || result.error || 'Sign in failed',
        message: result.message || 'Invalid email or password',
      };
    }

    const token = result.token || result.data?.token;
    
    // Store token if available
    if (token) {
      await storeToken(token);
    }

    return {
      success: true,
      token: token,
      user: result.user || result.data?.user,
      message: result.message || 'Sign in successful',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Unable to connect to server. Please check your connection.',
    };
  }
};

/**
 * Sign up function
 */
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.message || result.error || 'Sign up failed',
        message: result.message || 'Unable to create account',
      };
    }

    const token = result.token || result.data?.token;
    
    // Store token if available
    if (token) {
      await storeToken(token);
    }

    return {
      success: true,
      token: token,
      user: result.user || result.data?.user,
      message: result.message || 'Account created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      message: 'Unable to connect to server. Please check your connection.',
    };
  }
};

/**
 * Logout function
 * Clears stored tokens and user data
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear token from AsyncStorage
    await removeToken();
    
    // Clear any other stored user data if needed
    // await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // Continue with logout even if clearing storage fails
  }
};
