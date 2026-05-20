/**
 * =============================================================================
 * PocketStylist — Root Navigator
 * =============================================================================
 *
 * Decides whether to show the Auth stack or the main App tabs based on the
 * current Supabase session. Handles:
 *   - Auto-login (session persisted in AsyncStorage by Supabase)
 *   - Smooth animated transition between auth and app states
 *   - Full-screen loading splash while session is being restored
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  // While Supabase is restoring the persisted session from AsyncStorage,
  // show a branded loading splash so the user never sees a flicker.
  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>👗</Text>
        <Text style={styles.splashTitle}>PocketStylist</Text>
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={{ marginTop: SPACING.xl }}
        />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {isAuthenticated ? (
        // ── Authenticated: show main wardrobe app ──────────────────────────
        <Root.Screen name="App" component={AppNavigator} />
      ) : (
        // ── Not authenticated: show login / sign-up ────────────────────────
        <Root.Screen name="Auth" component={AuthNavigator} />
      )}
    </Root.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: {
    fontSize: 64,
    marginBottom: SPACING.base,
  },
  splashTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extraBold,
    letterSpacing: -0.5,
  },
});
