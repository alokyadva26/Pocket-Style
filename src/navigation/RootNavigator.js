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

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/useUserStore';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import TryOnScreen from '../screens/TryOnScreen';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, session, loading: authLoading } = useAuth();
  const { profile, fetchProfile, loading: profileLoading } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [isAuthenticated, session]);

  // While Supabase is restoring the persisted session from AsyncStorage,
  // or fetching the user profile, show a branded loading splash.
  if (authLoading || (isAuthenticated && profileLoading)) {
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
      {!isAuthenticated ? (
        // ── Not authenticated: show login / sign-up ────────────────────────
        <Root.Screen name="Auth" component={AuthNavigator} />
      ) : profile?.onboarding_completed ? (
        // ── Authenticated & Onboarded: show main wardrobe app ─────────────
        <Root.Group>
          <Root.Screen name="App" component={AppNavigator} />
          <Root.Screen 
            name="TryOn" 
            component={TryOnScreen} 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
          />
        </Root.Group>
      ) : (
        // ── Authenticated but needs Onboarding ─────────────────────────────
        <Root.Screen name="Onboarding" component={OnboardingScreen} />
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
