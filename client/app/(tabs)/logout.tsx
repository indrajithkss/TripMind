import { useEffect } from 'react';
import { router } from 'expo-router';
import { logout } from '@/services/authService';

/**
 * Logout Screen
 * Handles logout and redirects to sign-in page
 */
export default function LogoutScreen() {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear authentication data
        await logout();
        
        // Redirect to sign-in page
        router.replace('/sign-in');
      } catch (error) {
        console.error('Logout error:', error);
        // Redirect to sign-in page even if logout fails
        router.replace('/sign-in');
      }
    };

    handleLogout();
  }, []);

  // This component doesn't render anything as it immediately redirects
  return null;
}

