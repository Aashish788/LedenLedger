/**
 * Authentication Context with Premium Persistence
 * Implements Gmail/Khatabook-style instant auth state
 * - Optimistic loading from cache
 * - Background session validation
 * - Smart state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { secureStorage, generateCSRFToken, checkRateLimit } from '@/lib/security';
import { authCache } from '@/lib/authCache';
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
  const [isLoading, setIsLoading] = useState(true); // Start with true to prevent flash
  const [isInitialized, setIsInitialized] = useState(false);
  const [csrfToken, setCsrfToken] = useState(generateCSRFToken());
  
  // Track if we're currently validating to prevent race conditions
  const isValidatingRef = React.useRef(false);
  const initStartedRef = React.useRef(false);

  // Generate new CSRF token periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCsrfToken(generateCSRFToken());
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(interval);
  }, []);

  // INDUSTRY-GRADE: Single initialization with proper coordination
  useEffect(() => {
    // Prevent double initialization in React 18 Strict Mode
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    let mounted = true;
    let authSubscription: any = null;

    const initAuth = async () => {
      try {
        console.log('🔐 Auth initialization started');
        
        // Check for cached state first (instant UI)
        const cachedState = authCache.get();
        if (cachedState?.isAuthenticated && cachedState.user) {
          console.log('✅ Using cached auth state');
          setUser(cachedState.user);
          setIsLoading(false);
          // Still validate in background but don't block UI
        }

        // Always validate actual session on mount
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Session check error:', error);
          handleSignOut();
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        if (session?.user) {
          console.log('✅ Valid session found');
          await loadUserProfile(session.user, false);
          authCache.markSessionChecked();
        } else {
          console.log('ℹ️ No active session');
          handleSignOut();
        }

        setIsLoading(false);
        setIsInitialized(true);
        console.log('🔐 Auth initialization complete');

      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (mounted) {
          handleSignOut();
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Start initialization
    initAuth();
    
    // Set up auth state listener AFTER initialization
    const setupAuthListener = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event);
        
        // Ignore INITIAL_SESSION as we handle it in initAuth
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        if (event === 'SIGNED_IN' && session) {
          await loadUserProfile(session.user, false);
        } else if (event === 'SIGNED_OUT') {
          handleSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Silent refresh - update cache without showing loading
          await loadUserProfile(session.user, false);
        } else if (event === 'USER_UPDATED' && session) {
          await loadUserProfile(session.user, false);
        }
      });
      
      authSubscription = subscription;
    };

    setupAuthListener();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []); // Empty deps - run once on mount

  /**
   * Handle sign out - clear everything
   */
  const handleSignOut = (): void => {
    setUser(null);
    authCache.clear();
    secureStorage.clear();
    // Don't set loading to false here - let the caller handle it
  };

  // Load user profile from database
  const loadUserProfile = async (supabaseUser: SupabaseUser, showLoading: boolean = true): Promise<void> => {
    // Prevent concurrent loads
    if (isValidatingRef.current) {
      console.log('⏭️ Skipping concurrent profile load');
      return;
    }

    try {
      isValidatingRef.current = true;
      
      if (showLoading) {
        setIsLoading(true);
      }
      
      // Fetch user profile from profiles table
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      // Fetch business settings
      const { data: businessSettings, error: businessError} = await (supabase as any)
        .from('business_settings')
        .select('business_name, owner_name')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (businessError) {
        console.error('Error loading business settings:', businessError);
      }

      // Create user object with proper null handling
      const userName = (profile && profile.full_name) || (businessSettings && businessSettings.owner_name) || supabaseUser.email?.split('@')[0] || 'User';
      const businessName = businessSettings && businessSettings.business_name ? businessSettings.business_name : undefined;

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: userName,
        businessName: businessName,
        role: 'admin', // Default role, you can customize based on your logic
        lastLogin: new Date().toISOString()
      };

      setUser(userData);
      
      // Update cache for instant access on next load
      authCache.set(userData, true);
      
      // Store user data in secure storage for quick access
      secureStorage.setItem('auth_user', userData);
      secureStorage.setItem('last_activity', Date.now());
      
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (showLoading) {
        toast.error('Failed to load user profile');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
      
      isValidatingRef.current = false;
    }
  };

  const checkSession = async (): Promise<void> => {
    // Prevent concurrent session checks
    if (isValidatingRef.current) {
      console.log('⏭️ Skipping concurrent session check');
      return;
    }

    try {
      isValidatingRef.current = true;
      setIsLoading(true);
      
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        handleSignOut();
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user, false);
        authCache.markSessionChecked();
      } else {
        // No active session
        handleSignOut();
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Session check failed:', error);
      handleSignOut();
      setIsLoading(false);
    } finally {
      isValidatingRef.current = false;
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
      await loadUserProfile(data.user, true);

      // Update cache
      authCache.markSessionChecked();

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
      
      // Clear everything
      handleSignOut();
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Force local cleanup
      handleSignOut();
      
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
