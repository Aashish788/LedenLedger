/**
 * Authentication Context with Premium Persistence
 * Implements Gmail/Khatabook-style instant auth state
 * - Optimistic loading from cache
 * - Background session validation
 * - Smart state management
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  // Initialize with cached state for instant loading (like Gmail)
  const cachedState = authCache.get();
  const [user, setUser] = useState<User | null>(cachedState?.user || null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for optimistic loading
  const [csrfToken, setCsrfToken] = useState(generateCSRFToken());
  
  // FIX: Store timer IDs for proper cleanup (CRITICAL MEMORY LEAK FIX)
  const csrfIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // FIX: CRITICAL - Prevent race condition in concurrent auth checks
  const isValidatingSessionRef = useRef(false);

  // Generate new CSRF token periodically
  useEffect(() => {
    // FIX: Clear any existing interval before creating new one
    if (csrfIntervalRef.current) {
      clearInterval(csrfIntervalRef.current);
    }
    
    csrfIntervalRef.current = setInterval(() => {
      setCsrfToken(generateCSRFToken());
    }, 30 * 60 * 1000); // Every 30 minutes

    // FIX: Proper cleanup - CRITICAL for preventing memory leaks
    return () => {
      if (csrfIntervalRef.current) {
        clearInterval(csrfIntervalRef.current);
        csrfIntervalRef.current = null;
      }
    };
  }, []);

  // Professional initialization - check session in background only if needed
  useEffect(() => {
    // If we have cached auth, validate in background (non-blocking)
    const initAuth = async () => {
      // CRITICAL FIX: Import session initialization helper
      const { ensureSessionReady } = await import('@/integrations/supabase/client');
      
      // INDUSTRY-GRADE: Ensure Supabase session is loaded from storage first
      await ensureSessionReady();
      
      if (cachedState?.isAuthenticated) {
        // User sees UI immediately, we validate in background
        validateSessionInBackground();
      } else {
        // No cache, check session (but only once on mount)
        await checkSession();
      }
    };

    initAuth();
    
    // Listen for auth state changes (token refresh, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (import.meta.env.DEV) {
      console.log('Auth state changed:', event);
    }
      
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user, false);
      } else if (event === 'SIGNED_OUT') {
        handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Silent refresh - update cache without showing loading
        await loadUserProfile(session.user, false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Validate session in background without blocking UI
   * FIX: CRITICAL - Added mutex to prevent concurrent validation
   */
  const validateSessionInBackground = async (): Promise<void> => {
    // FIX: Prevent concurrent validation calls (race condition)
    if (isValidatingSessionRef.current) {
      if (import.meta.env.DEV) {
        console.log('⏭️ Skipping validation - already in progress');
      }
      return;
    }
    
    // Don't check if we checked recently
    if (!authCache.shouldCheckSession()) {
      return;
    }

    try {
      isValidatingSessionRef.current = true; // Lock
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Session invalid, clear cache and state
        handleSignOut();
        return;
      }

      // Session valid, update cache timestamp
      authCache.markSessionChecked();
      
      // Optionally refresh user profile if data might be stale
      // But don't show loading state
      await loadUserProfile(session.user, false);
    } catch (error) {
      console.error('Background session validation failed:', error);
      // Don't logout on network errors, keep using cache
    } finally {
      isValidatingSessionRef.current = false; // Unlock
    }
  };

  /**
   * Handle sign out - clear everything
   */
  const handleSignOut = (): void => {
    setUser(null);
    authCache.clear();
    secureStorage.clear();
    setIsLoading(false);
  };

  // Load user profile from database
  const loadUserProfile = async (supabaseUser: SupabaseUser, showLoading: boolean = true): Promise<void> => {
    try {
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

      // FIX: Improved null safety with optional chaining and proper defaults
      const userName = 
        profile?.full_name || 
        businessSettings?.owner_name || 
        supabaseUser.email?.split('@')[0] || 
        'User';
      
      // FIX: Safe access to businessSettings properties
      const businessName = businessSettings?.business_name ?? undefined;

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
      
      // FIX: Wrap storage operations in try-catch for private browsing support
      try {
        secureStorage.setItem('auth_user', userData);
        secureStorage.setItem('last_activity', Date.now());
      } catch (storageError) {
        // Silent fail for private browsing mode
        if (import.meta.env.DEV) {
          console.error('Failed to save to storage (private mode?):', storageError);
        }
      }
      
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (showLoading) {
        toast.error('Failed to load user profile');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const checkSession = async (): Promise<void> => {
    try {
      // Don't show loading for background checks
      const shouldShowLoading = !authCache.isAuthenticated();
      
      if (shouldShowLoading) {
        setIsLoading(true);
      }
      
      // CRITICAL FIX: Ensure session is ready before checking
      const { ensureSessionReady } = await import('@/integrations/supabase/client');
      await ensureSessionReady();
      
      // Check Supabase session with retry logic
      let session = null;
      let error = null;
      
      // Try up to 3 times with delays (handles browser reopen scenario)
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase.auth.getSession();
        error = result.error;
        session = result.data.session;
        
        if (session || error) {
          break; // Got a session or a real error
        }
        
        // No session yet, wait and retry (session might still be loading)
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (error) {
        console.error('Session check error:', error);
        handleSignOut();
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user, shouldShowLoading);
        authCache.markSessionChecked();
      } else {
        // No active session after retries
        handleSignOut();
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // On error, if we have cache, keep using it (offline support)
      if (!authCache.isAuthenticated()) {
        handleSignOut();
      }
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

    // FIX: Clear any existing interval before creating new one
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
    }

    // Check activity every minute
    activityIntervalRef.current = setInterval(checkActivity, 60 * 1000);
    
    // Update activity on user interactions
    const updateActivity = () => secureStorage.setItem('last_activity', Date.now());
    
    document.addEventListener('click', updateActivity);
    document.addEventListener('keypress', updateActivity);
    document.addEventListener('scroll', updateActivity);

    return () => {
      // FIX: Proper cleanup - CRITICAL for preventing memory leaks
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
        activityIntervalRef.current = null;
      }
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
