/**
 * PocketStylist — Bottom Tab Navigation
 * Sets up the three-tab navigation: My Closet, Style Me, and Profile.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import ClosetScreen from '../screens/ClosetScreen';
import StyleMeScreen from '../screens/StyleMeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Custom tab bar icon component.
 */
function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={styles.iconEmoji}>{emoji}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Closet"
        component={ClosetScreen}
        options={{
          tabBarLabel: 'My Closet',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👗" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="StyleMe"
        component={StyleMeScreen}
        options={{
          tabBarLabel: 'Style Me',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 70,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semiBold,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary + '20',
  },
  iconEmoji: {
    fontSize: 22,
  },
});
