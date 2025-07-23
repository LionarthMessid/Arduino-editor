import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);
        if (session?.user) {
          console.log('Active session found for user:', session.user.email);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign in with OAuth provider
  const signInWithOAuth = async (provider) => {
    try {
      console.log(`Initiating OAuth sign in with ${provider}`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error(`${provider} OAuth sign in error:`, error);
        return { error };
      }
      return { success: true };
    } catch (error) {
      console.error(`Unexpected error during ${provider} OAuth sign in:`, error);
      return { error };
    }
  };

  // Sign in with email and password
  const signInWithEmail = async (email, password) => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      // Validate inputs
      if (!email || !password) {
        console.error('Email sign in error: Missing email or password');
        return { error: { message: 'Email and password are required' } };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Email sign in error:', error.message);
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Invalid email or password' } };
        }
        return { error };
      }
      
      console.log('Sign in successful for:', email);
      return { data };
    } catch (error) {
      console.error('Error signing in with email:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email, password) => {
    try {
      console.log('Attempting to sign up with email:', email);
      
      // Validate inputs
      if (!email || !password) {
        console.error('Email sign up error: Missing email or password');
        return { error: { message: 'Email and password are required' } };
      }
      
      if (password.length < 6) {
        console.error('Email sign up error: Password too short');
        return { error: { message: 'Password must be at least 6 characters long' } };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) {
        console.error('Email sign up error:', error.message);
        return { error };
      }
      
      console.log('Sign up response:', data);
      
      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        console.log('Email already registered but not confirmed');
        return { 
          message: 'This email is already registered. Please check your email for the confirmation link or try signing in.' 
        };
      }
      
      // Check if email confirmation is required by Supabase settings
      if (data?.user && !data?.session) {
        console.log('Email confirmation required for new signup');
        return { 
          message: 'Registration successful! Please check your email for a confirmation link to complete your signup.' 
        };
      }
      
      console.log('Sign up successful for:', email);
      return { data };
    } catch (error) {
      console.error('Error signing up with email:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('Signing out user:', user?.email);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }
      console.log('Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: { message: 'An unexpected error occurred during sign out.' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithOAuth,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;