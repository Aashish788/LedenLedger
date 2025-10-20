/**
 * Centralized Authentication State Manager
 * 
 * INDUSTRY-GRADE SOLUTION:
 * - Single source of truth for auth state
 * - Global mutex to prevent concurrent session checks
 * - Smart caching with TTL to minimize Supabase calls
 * - Observable pattern for reactive updates
 * - Fixes infinite loading on localhost
 * 
 * @version 1.0.0 - Production Ready
 */

import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface CachedSession {
  session: Session | null;
  timestamp: number;
  isValidating: boolean;
}

type AuthStateListener = (session: Session | null) => void;

/**
 * Centralized Auth State Manager
 * Prevents race conditions and concurrent session checks
 */
class AuthStateManager {
  private static instance: AuthStateManager;
  
  // Cached session state
  private cachedSession: CachedSession | null = null;
  
  // Global mutex for session validation
  private isValidating = false;
  private validationPromise: Promise<Session | null> | null = null;
  
  // Session cache TTL (time-to-live)
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds
  
  // Request timeout to prevent infinite loading
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  
  // Listeners for reactive updates
  private listeners: Set<AuthStateListener> = new Set();
  
  // Supabase auth state change subscription
  private authSubscription: any = null;

  private constructor() {
    this.initializeAuthListener();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  /**
   * Fetch session with timeout protection
   * INDUSTRY-GRADE: Prevents infinite loading
   */
  private async fetchSessionWithTimeout(): Promise<Session | null> {
    return new Promise((resolve) => {
      // Set timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('[AuthStateManager] ⏱️ Session fetch timeout after', this.REQUEST_TIMEOUT, 'ms');
        this.isValidating = false;
        this.validationPromise = null;
        this.cachedSession = {
          session: null,
          timestamp: Date.now(),
          isValidating: false,
        };
        resolve(null);
      }, this.REQUEST_TIMEOUT);

      // Fetch session
      (async () => {
        try {
          if (import.meta.env.DEV) {
            console.log('[AuthStateManager] 🔄 Fetching session from Supabase...');
          }

          const { data: { session }, error } = await supabase.auth.getSession();

          // Clear timeout - we got a response
          clearTimeout(timeoutId);

          if (error) {
            console.error('[AuthStateManager] ❌ Session fetch error:', error);
            this.cachedSession = {
              session: null,
              timestamp: Date.now(),
              isValidating: false,
            };
            resolve(null);
            return;
          }

          // Update cache
          this.cachedSession = {
            session,
            timestamp: Date.now(),
            isValidating: false,
          };

          if (import.meta.env.DEV) {
            console.log('[AuthStateManager] ✅ Session fetched:', session ? 'authenticated' : 'not authenticated');
          }

          resolve(session);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('[AuthStateManager] ❌ Unexpected error:', error);
          this.cachedSession = {
            session: null,
            timestamp: Date.now(),
            isValidating: false,
          };
          resolve(null);
        } finally {
          this.isValidating = false;
          this.validationPromise = null;
        }
      })();
    });
  }

  /**
   * Initialize Supabase auth state listener
   * CRITICAL: Single point of auth state changes
   */
  private initializeAuthListener(): void {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log('[AuthStateManager] 🔐 Auth state changed:', event);
      }

      // Update cached session
      this.cachedSession = {
        session,
        timestamp: Date.now(),
        isValidating: false,
      };

      // Notify all listeners
      this.notifyListeners(session);
    });

    this.authSubscription = data.subscription;
  }

  /**
   * Get current session with smart caching
   * INDUSTRY-GRADE: Prevents concurrent calls and uses cache
   * 
   * @param forceRefresh - Force fetch from Supabase (bypass cache)
   * @returns Session or null
   */
  public async getSession(forceRefresh: boolean = false): Promise<Session | null> {
    // Check if cache is valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      if (import.meta.env.DEV) {
        console.log('[AuthStateManager] ✅ Using cached session');
      }
      return this.cachedSession!.session;
    }

    // If already validating, wait for that promise
    if (this.isValidating && this.validationPromise) {
      if (import.meta.env.DEV) {
        console.log('[AuthStateManager] ⏳ Waiting for existing validation...');
      }
      return this.validationPromise;
    }

    // Start new validation
    this.isValidating = true;
    
    this.validationPromise = this.fetchSessionWithTimeout();

    return this.validationPromise;
  }

  /**
   * Get user ID from session
   * Convenience method for common use case
   */
  public async getUserId(): Promise<string | null> {
    const session = await this.getSession();
    return session?.user?.id || null;
  }

  /**
   * Get user from session
   * Convenience method
   */
  public async getUser(): Promise<User | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cachedSession) return false;
    
    const age = Date.now() - this.cachedSession.timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Invalidate cache (force next call to fetch from Supabase)
   */
  public invalidateCache(): void {
    if (import.meta.env.DEV) {
      console.log('[AuthStateManager] 🗑️ Cache invalidated');
    }
    this.cachedSession = null;
  }

  /**
   * Clear session (logout)
   */
  public clearSession(): void {
    this.cachedSession = {
      session: null,
      timestamp: Date.now(),
      isValidating: false,
    };
    this.notifyListeners(null);
  }

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  public subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current session
    if (this.cachedSession) {
      listener(this.cachedSession.session);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of session change
   */
  private notifyListeners(session: Session | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        console.error('[AuthStateManager] Listener error:', error);
      }
    });
  }

  /**
   * Check if currently authenticated (from cache)
   * Non-async for immediate checks
   */
  public isAuthenticated(): boolean {
    return this.cachedSession?.session !== null && this.cachedSession?.session !== undefined;
  }

  /**
   * Get cached session synchronously (may be stale)
   * Use only for UI optimistic rendering
   */
  public getCachedSession(): Session | null {
    return this.cachedSession?.session || null;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.listeners.clear();
    this.cachedSession = null;
    this.isValidating = false;
    this.validationPromise = null;
  }
}

// Export singleton instance
export const authStateManager = AuthStateManager.getInstance();

// Export type for convenience
export type { AuthStateListener };
