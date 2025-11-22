import { Redirect } from 'expo-router';

/**
 * Tabs Index Route
 * Redirects to home tab when navigating to /(tabs)
 */
export default function TabsIndex() {
  return <Redirect href="/(tabs)/home" />;
}

