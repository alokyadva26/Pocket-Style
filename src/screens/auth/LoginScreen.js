/**
 * =============================================================================
 * PocketStylist — Login Screen
 * =============================================================================
 *
 * Features:
 *   - Email / password login
 *   - Google Sign In via expo-auth-session + Supabase signInWithIdToken
 *   - Loading states per button
 *   - Inline field validation
 *   - Navigate to Sign Up
 *   - Forgot password prompt
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import AuthDivider from '../../components/auth/AuthDivider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

// Required for expo-auth-session to work correctly on Android
WebBrowser.maybeCompleteAuthSession();

// ─── Validation helpers ──────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ─── Google OAuth setup ────────────────────────────────────────────────────
  // Replace YOUR_GOOGLE_CLIENT_ID with your actual Expo/Android/Web client IDs
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ scheme: 'com.pocketstylist.app' }),
  });

  // Handle Google auth response
  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.params?.id_token);
    }
  }, [response]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function validate() {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes('invalid login')) {
        Alert.alert('Login Failed', 'Incorrect email or password. Please try again.');
      } else {
        Alert.alert('Login Failed', error.message || 'Something went wrong.');
      }
    }
    // On success: AuthContext updates session → RootNavigator automatically
    // switches to the main app — no manual navigation needed.
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await promptAsync();
    // Response handled in the useEffect above
    setGoogleLoading(false);
  }

  async function handleGoogleSuccess(idToken) {
    if (!idToken) {
      Alert.alert('Google Sign In', 'Could not retrieve Google token. Please try again.');
      return;
    }
    setGoogleLoading(true);
    const { error } = await signInWithGoogle(idToken);
    setGoogleLoading(false);
    if (error) {
      Alert.alert('Google Sign In Failed', error.message || 'Something went wrong.');
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <View style={styles.header}>
          <Text style={styles.logo}>👗</Text>
          <Text style={styles.brand}>PocketStylist</Text>
          <Text style={styles.tagline}>Your AI digital wardrobe</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <AuthInput
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setEmailError(''); }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
            editable={!loading}
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
            placeholder="Your password"
            secureTextEntry
            autoComplete="current-password"
            error={passwordError}
            editable={!loading}
          />

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => Alert.alert(
              'Reset Password',
              'Enter your email to receive a reset link.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Send Link',
                  onPress: async () => {
                    if (!validateEmail(email)) {
                      Alert.alert('Enter your email first');
                      return;
                    }
                    await supabase.auth.resetPasswordForEmail(email.trim());
                    Alert.alert('Sent!', 'Check your email for the reset link.');
                  },
                },
              ]
            )}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <AuthButton
            label="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={googleLoading}
          />

          <AuthDivider />

          <AuthButton
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading}
            variant="social"
            icon="🔵"
          />
        </View>

        {/* Sign up link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING['3xl'],
  },
  header: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logo: { fontSize: 56, marginBottom: SPACING.sm },
  brand: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extraBold,
    letterSpacing: -0.5,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sm,
    marginBottom: SPACING.xl,
  },
  forgotRow: { alignItems: 'flex-end', marginTop: -SPACING.sm, marginBottom: SPACING.base },
  forgotText: {
    color: COLORS.primaryLight,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm },
  footerLink: {
    color: COLORS.primaryLight,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
  },
});
