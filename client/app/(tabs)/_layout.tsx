import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        animation: 'shift',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => <MaterialIcons name="event-note" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Logout',
          tabBarIcon: ({ color }) => <MaterialIcons name="exit-to-app" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          href: null, // Hide from tab bar but keep tab bar visible
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          href: null, // Hide from tab bar but keep tab bar visible
        }}
      />
      <Tabs.Screen
        name="trip-plan"
        options={{
          href: null, // Hide from tab bar but keep tab bar visible
        }}
      />
      <Tabs.Screen
        name="my-trips"
        options={{
          href: null, // Hide from tab bar but keep tab bar visible
        }}
      />
    </Tabs>
  );
}
