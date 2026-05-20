/**
 * =============================================================================
 * PocketStylist — Auth Context
 * =============================================================================
 *
 * Provides authentication state (session, user, loading) and actions
 * (signIn, signUp, signOut, signInWithGoogle) to the entire app tree.
 *
 * Supabase handles session persistence automatically via AsyncStorage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Listen to Supabase auth state changes (login, logout, token refresh, etc.)
  useEffect(() => {
    // Get the current session on mount (handles auto-login from AsyncStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to future auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  /**
   * Sign in with email + password.
   * @returns {{ error: Error|null }}
   */
  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  /**
   * Sign up with email + password.
   * @returns {{ error: Error|null, needsVerification: boolean }}
   */
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    // If email confirmation is enabled, the session won't be set immediately
    const needsVerification = !error && !data.session;
    return { error, needsVerification };
  };

  /**
   * Sign in with a Google OAuth token (obtained via expo-auth-session).
   * Call this after getting the id_token from Google.
   * @param {string} idToken - Google ID token
   * @returns {{ error: Error|null }}
   */
  const signInWithGoogle = async (idToken) => {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    return { error };
  };

  /**
   * Sign out the current user.
   * @returns {{ error: Error|null }}
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // ─── Value ────────────────────────────────────────────────────────────────

  const value = {
    session,
    user,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Custom hook to access auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
