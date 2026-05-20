/**
 * =============================================================================
 * PocketStylist — Main Application Entry Point
 * =============================================================================
 *
 * A digital wardrobe and AI outfit generator with Supabase authentication.
 *
 * Tech Stack:
 *   - React Native with Expo
 *   - Supabase for auth (email + Google OAuth) with session persistence
 *   - SQLite for local wardrobe data
 *   - Zustand for state management
 *   - expo-image for optimized image rendering
 *   - expo-image-picker for camera/gallery
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { getDatabase } from './src/database/database';
import { COLORS, TYPOGRAPHY, SPACING } from './src/constants/theme';

/**
 * Root component — initializes the SQLite database, wraps the app in
 * AuthProvider (Supabase session), and renders the navigation tree.
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize SQLite database (creates tables if they don't exist)
        await getDatabase();
        setIsReady(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setInitError(error.message);
      }
    }
    initializeApp();
  }, []);

  // ── Loading / error splash ─────────────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={styles.splash}>
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
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={{ marginTop: SPACING.lg }}
            />
          </>
        )}
      </View>
    );
  }

  // ── Navigation theme ───────────────────────────────────────────────────────
  // React Navigation v7 requires a `fonts` object to avoid
  // "Cannot read property 'medium' of undefined" in the tab bar.
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
      regular: { fontFamily: 'System', fontWeight: TYPOGRAPHY.regular },
      medium: { fontFamily: 'System', fontWeight: TYPOGRAPHY.medium },
      bold: { fontFamily: 'System', fontWeight: TYPOGRAPHY.bold },
      heavy: { fontFamily: 'System', fontWeight: TYPOGRAPHY.extraBold },
    },
  };

  return (
    <SafeAreaProvider>
      {/* AuthProvider must wrap NavigationContainer so screens can call useAuth() */}
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          {/* RootNavigator switches between Auth and App stacks based on session */}
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: { fontSize: 64, marginBottom: SPACING.lg },
  loadingTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extraBold,
  },
  errorIcon: { fontSize: 48, marginBottom: SPACING.md },
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
