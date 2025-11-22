import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { PlannerProvider } from '@/contexts/PlannerContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  // Create custom theme with global background color
  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: backgroundColor,
    },
  };

  return (
    <SafeAreaProvider>
      <PlannerProvider>
        <View style={[styles.container, { backgroundColor }]}>
          <ThemeProvider value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen 
                name="location-picker" 
                options={{ 
                  presentation: 'modal',
                  headerShown: false,
                }} 
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </View>
      </PlannerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
