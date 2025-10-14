/**
 * Authentication Context with Security Features
 * Provides authentication state and security controls throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureStorage, generateCSRFToken, checkRateLimit } from '@/lib/security';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  lastLogin?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  csrfToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(generateCSRFToken());

  // Generate new CSRF token periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCsrfToken(generateCSRFToken());
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Check authentication status on mount and set up auth listener
  useEffect(() => {
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, loading profile...');
        await loadUserProfile(session.user);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        secureStorage.clear();
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed');
        await loadUserProfile(session.user);
      } else if (event === 'INITIAL_SESSION') {
        if (session) {
          console.log('Initial session found, loading profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('No initial session');
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile from database
  const loadUserProfile = async (supabaseUser: SupabaseUser): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Loading profile for user:', supabaseUser.id);
      
      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading profile:', profileError);
      }

      // Fetch business settings
      const { data: businessSettings, error: businessError} = await (supabase as any)
        .from('business_settings')
        .select('business_name, owner_name')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error loading business settings:', businessError);
      }

      // Create user object with proper null handling
      const userName = (profile?.full_name) || (businessSettings?.owner_name) || supabaseUser.email?.split('@')[0] || 'User';
      const businessName = businessSettings?.business_name || undefined;

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: userName,
        businessName: businessName,
        role: 'admin', // Default role, you can customize based on your logic
        lastLogin: new Date().toISOString()
      };

      console.log('User profile loaded successfully:', userData.email);
      setUser(userData);
      
      // Store user data in secure storage for quick access
      secureStorage.setItem('auth_user', userData);
      secureStorage.setItem('last_activity', Date.now());
      
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Don't show error toast, just log it - user can still be authenticated
      // Create minimal user object
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'User',
        role: 'admin',
        lastLogin: new Date().toISOString()
      };
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSession = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        await logout();
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        // No active session
        setUser(null);
        secureStorage.clear();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Rate limiting check
      if (!checkRateLimit(`login_${email}`, 5, 15 * 60 * 1000)) {
        toast.error('Too many login attempts. Please try again in 15 minutes.');
        return false;
      }

      setIsLoading(true);

      // Basic validation
      if (!email.trim() || !password.trim()) {
        toast.error('Please enter both email and password');
        return false;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address');
        return false;
      }

      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password', {
            description: 'Please check your credentials and try again'
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email not verified', {
            description: 'Please verify your email address first'
          });
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts', {
            description: 'Please try again later'
          });
        } else {
          console.error('Login error:', error);
          toast.error('Login failed', {
            description: 'Unable to sign in. Please try again later.'
          });
        }
        return false;
      }

      if (!data.user) {
        toast.error('Login failed', {
          description: 'No user data received'
        });
        return false;
      }

      // Load user profile
      await loadUserProfile(data.user);

      // Update last activity
      secureStorage.setItem('last_activity', Date.now());

      toast.success('Login successful', {
        description: `Welcome back!`
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed', {
        description: 'An unexpected error occurred. Please try again.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Continue with local cleanup even if server logout fails
      }
      
      // Clear secure storage
      secureStorage.clear();
      
      // Clear user state
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Force local cleanup
      secureStorage.clear();
      setUser(null);
      
      toast.error('Logout completed with errors');
    } finally {
      setIsLoading(false);
    }
  };

  // Activity monitoring for auto-logout
  useEffect(() => {
    if (!user) return;

    const checkActivity = () => {
      const lastActivity = secureStorage.getItem('last_activity');
      const inactivityTimeout = 2 * 60 * 60 * 1000; // 2 hours
      
      if (lastActivity && Date.now() - lastActivity > inactivityTimeout) {
        toast.warning('Session expired due to inactivity');
        logout();
        return;
      }
      
      secureStorage.setItem('last_activity', Date.now());
    };

    // Check activity every minute
    const interval = setInterval(checkActivity, 60 * 1000);
    
    // Update activity on user interactions
    const updateActivity = () => secureStorage.setItem('last_activity', Date.now());
    
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('scroll', updateActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener('click', updateActivity);
      document.removeEventListener('keypress', updateActivity);
      document.removeEventListener('scroll', updateActivity);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkSession,
    csrfToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook for checking if user has specific permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    canAccessAdmin: user?.role === 'admin',
    canManageUsers: user?.role === 'admin',
    canViewReports: !!user,
    canCreateInvoices: !!user,
    canManageCustomers: !!user
  };
}

export default AuthContext;
