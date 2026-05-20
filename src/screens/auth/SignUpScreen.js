/**
 * =============================================================================
 * PocketStylist — Sign Up Screen
 * =============================================================================
 *
 * Features:
 *   - Email / password registration
 *   - Google Sign In
 *   - Password strength indicator
 *   - Inline field validation
 *   - Email verification notice
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

import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import AuthDivider from '../components/auth/AuthDivider';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

// ─── Validation helpers ──────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: COLORS.border };
  if (password.length < 6) return { level: 1, label: 'Too short', color: COLORS.error };
  if (password.length < 8) return { level: 2, label: 'Weak', color: '#F59E0B' };
  if (/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
    return { level: 4, label: 'Strong', color: '#10B981' };
  }
  if (password.length >= 8) return { level: 3, label: 'Good', color: '#3B82F6' };
  return { level: 2, label: 'Weak', color: '#F59E0B' };
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function SignUpScreen({ navigation }) {
  const { signUp, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verified, setVerified] = useState(false); // email verification sent state

  const strength = getPasswordStrength(password);

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({ scheme: 'com.pocketstylist.app' }),
  });

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
    setConfirmError('');

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

    if (!confirm) {
      setConfirmError('Please confirm your password');
      valid = false;
    } else if (confirm !== password) {
      setConfirmError('Passwords do not match');
      valid = false;
    }

    return valid;
  }

  async function handleSignUp() {
    if (!validate()) return;

    setLoading(true);
    const { error, needsVerification } = await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        Alert.alert('Account Exists', 'This email is already registered. Try logging in instead.');
      } else {
        Alert.alert('Sign Up Failed', error.message || 'Something went wrong.');
      }
      return;
    }

    if (needsVerification) {
      setVerified(true); // show verification notice
    }
    // If no verification needed, AuthContext auto-sets session → app loads
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await promptAsync();
    setGoogleLoading(false);
  }

  async function handleGoogleSuccess(idToken) {
    if (!idToken) return;
    setGoogleLoading(true);
    const { error } = await signInWithGoogle(idToken);
    setGoogleLoading(false);
    if (error) Alert.alert('Google Sign In Failed', error.message);
  }

  // ─── Email verification screen ────────────────────────────────────────────

  if (verified) {
    return (
      <View style={styles.verifyContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.verifyIcon}>📬</Text>
        <Text style={styles.verifyTitle}>Check your inbox</Text>
        <Text style={styles.verifyBody}>
          We've sent a verification link to{' '}
          <Text style={styles.verifyEmail}>{email.trim()}</Text>.{'\n\n'}
          Open the link to activate your account, then come back and sign in.
        </Text>
        <AuthButton
          label="Back to Sign In"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: SPACING.xl }}
        />
      </View>
    );
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
          <Text style={styles.tagline}>Create your style profile</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start building your digital wardrobe</Text>

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
            placeholder="Create a strong password"
            secureTextEntry
            autoComplete="new-password"
            error={passwordError}
            editable={!loading}
          />

          {/* Password strength bar */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthSegment,
                    { backgroundColor: i <= strength.level ? strength.color : COLORS.border },
                  ]}
                />
              ))}
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          <AuthInput
            label="Confirm Password"
            value={confirm}
            onChangeText={(t) => { setConfirm(t); setConfirmError(''); }}
            placeholder="Repeat your password"
            secureTextEntry
            autoComplete="new-password"
            error={confirmError}
            editable={!loading}
          />

          <AuthButton
            label="Create Account"
            onPress={handleSignUp}
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

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
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
  tagline: { color: COLORS.textMuted, fontSize: TYPOGRAPHY.sm, marginTop: 4 },
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
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.base,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semiBold,
    marginLeft: SPACING.xs,
    width: 52,
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
  // Verification state
  verifyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  verifyIcon: { fontSize: 64, marginBottom: SPACING.xl },
  verifyTitle: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    marginBottom: SPACING.base,
  },
  verifyBody: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  verifyEmail: { color: COLORS.primary, fontWeight: TYPOGRAPHY.semiBold },
});
