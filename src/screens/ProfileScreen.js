/**
 * =============================================================================
 * PocketStylist — Profile Screen
 * =============================================================================
 *
 * Shows user account information and provides a sign-out button.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import AuthButton from '../components/auth/AuthButton';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const email = user?.email ?? 'Unknown';
  const provider = user?.app_metadata?.provider ?? 'email';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PocketStylist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            const { error } = await signOut();
            setLoggingOut(false);
            if (error) {
              Alert.alert('Error', 'Could not sign out. Please try again.');
            }
            // On success: AuthContext clears session → RootNavigator
            // automatically switches to the Auth stack.
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.emailText}>{email}</Text>
          <View style={styles.providerBadge}>
            <Text style={styles.providerText}>
              {provider === 'google' ? '🔵 Google Account' : '✉️ Email Account'}
            </Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <InfoRow label="Email" value={email} />
          <InfoRow label="Sign-in method" value={provider === 'google' ? 'Google' : 'Email & Password'} />
          <InfoRow label="Member since" value={createdAt} />
          <InfoRow label="User ID" value={user?.id ? user.id.slice(0, 16) + '…' : '—'} mono />
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <InfoRow label="App" value="PocketStylist" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Platform" value="Expo SDK 54" />
        </View>

        {/* Logout */}
        <AuthButton
          label="Sign Out"
          onPress={handleSignOut}
          loading={loggingOut}
          variant="secondary"
          icon="🚪"
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function InfoRow({ label, value, mono = false }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, mono && infoStyles.mono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sm,
    flex: 1,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    flex: 2,
    textAlign: 'right',
  },
  mono: {
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.textMuted,
  },
});

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.base,
    ...SHADOWS.glow,
  },
  avatarLetter: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.extraBold,
  },
  emailText: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semiBold,
    marginBottom: SPACING.sm,
  },
  providerBadge: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerText: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.medium,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingVertical: SPACING.base,
  },
  logoutButton: {
    marginTop: SPACING.base,
  },
});
