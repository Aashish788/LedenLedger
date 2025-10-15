/**
 * Professional Authentication Cache System
 * Implements Gmail/Khatabook-style auth persistence
 * - Instant auth state access
 * - Smart caching with expiry
 * - Background validation
 * - Optimistic loading
 */

import type { User } from '@/contexts/AuthContext';

const AUTH_CACHE_KEY = 'auth_cache';
const AUTH_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes
const SESSION_CHECK_COOLDOWN = 60 * 1000; // 1 minute cooldown between checks

interface AuthCache {
  user: User | null;
  isAuthenticated: boolean;
  timestamp: number;
  lastChecked: number;
}

class AuthCacheManager {
  private memoryCache: AuthCache | null = null;
  private lastCheckTime = 0;

  /**
   * Get cached auth state (instant, no async)
   * Returns cached state or null if expired/not found
   */
  get(): AuthCache | null {
    // First check memory cache (fastest)
    if (this.memoryCache && !this.isExpired(this.memoryCache.timestamp)) {
      return this.memoryCache;
    }

    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (!cached) return null;

      const parsed: AuthCache = JSON.parse(cached);
      
      // Check if cache is still valid
      if (this.isExpired(parsed.timestamp)) {
        this.clear();
        return null;
      }

      // Update memory cache
      this.memoryCache = parsed;
      return parsed;
    } catch (error) {
      console.error('Error reading auth cache:', error);
      return null;
    }
  }

  /**
   * Set auth cache (optimistic update)
   */
  set(user: User | null, isAuthenticated: boolean): void {
    const cache: AuthCache = {
      user,
      isAuthenticated,
      timestamp: Date.now(),
      lastChecked: Date.now()
    };

    // Update memory cache immediately
    this.memoryCache = cache;

    // Update localStorage (async, non-blocking)
    try {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error writing auth cache:', error);
    }
  }

  /**
   * Check if we should validate session
   * Returns true if enough time has passed since last check
   */
  shouldCheckSession(): boolean {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastCheckTime;
    
    // Don't check if we checked recently (cooldown period)
    if (timeSinceLastCheck < SESSION_CHECK_COOLDOWN) {
      return false;
    }

    return true;
  }

  /**
   * Mark that we just checked the session
   */
  markSessionChecked(): void {
    this.lastCheckTime = Date.now();
    
    if (this.memoryCache) {
      this.memoryCache.lastChecked = Date.now();
      try {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(this.memoryCache));
      } catch (error) {
        console.error('Error updating lastChecked:', error);
      }
    }
  }

  /**
   * Clear all auth cache
   */
  clear(): void {
    this.memoryCache = null;
    this.lastCheckTime = 0;
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  }

  /**
   * Check if cache timestamp is expired
   */
  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > AUTH_CACHE_EXPIRY;
  }

  /**
   * Get cached user without full cache object
   */
  getUser(): User | null {
    const cache = this.get();
    return cache?.user || null;
  }

  /**
   * Get cached auth status
   */
  isAuthenticated(): boolean {
    const cache = this.get();
    return cache?.isAuthenticated || false;
  }

  /**
   * Update user info without changing auth state
   */
  updateUser(user: User): void {
    if (this.memoryCache) {
      this.memoryCache.user = user;
      this.memoryCache.timestamp = Date.now();
      try {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(this.memoryCache));
      } catch (error) {
        console.error('Error updating user in cache:', error);
      }
    }
  }

  /**
   * Invalidate cache (force next check)
   */
  invalidate(): void {
    this.lastCheckTime = 0;
  }
}

// Export singleton instance
export const authCache = new AuthCacheManager();
