/**
 * =============================================================================
 * PocketStylist — Main Application Entry Point
 * =============================================================================
 * 
 * A digital wardrobe and AI outfit generator.
 * 100% offline — no cloud backend required.
 * 
 * Tech Stack:
 *   - React Native with Expo
 *   - SQLite for local database
 *   - Zustand for state management
 *   - expo-image for optimized image rendering
 *   - expo-image-picker for camera/gallery
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { getDatabase } from './src/database/database';
import { COLORS, TYPOGRAPHY, SPACING } from './src/constants/theme';

/**
 * Root component — initializes the database and renders the navigation.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize SQLite database (creates tables if needed)
        await getDatabase();
        setIsReady(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setInitError(error.message);
      }
    }

    initializeApp();
  }, []);

  // Show loading screen while database initializes
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        {initError ? (
          <>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Failed to initialize</Text>
            <Text style={styles.errorDetail}>{initError}</Text>
          </>
        ) : (
          <>
            <Text style={styles.loadingIcon}>👗</Text>
            <Text style={styles.loadingTitle}>PocketStylist</Text>
            <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: SPACING.lg }} />
          </>
        )}
      </View>
    );
  }

  // Navigation theme to match our dark design
  // React Navigation v7 requires `fonts` in the theme — the tab bar
  // internally accesses `theme.fonts.medium` for label styling.
  const navTheme = {
    dark: true,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.textPrimary,
      border: COLORS.border,
      notification: COLORS.accent,
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: TYPOGRAPHY.regular,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: TYPOGRAPHY.medium,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: TYPOGRAPHY.bold,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: TYPOGRAPHY.extraBold,
      },
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  loadingTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extraBold,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.sm,
  },
  errorDetail: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
});
