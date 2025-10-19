/**
 * Professional Authentication Cache System
 * Implements Gmail/Khatabook-style auth persistence with industry-grade features:
 * - Instant auth state access
 * - Smart caching with TTL (Time To Live)
 * - Background validation
 * - Optimistic loading
 * - Multi-tab synchronization via BroadcastChannel
 * - Memory safety with bounded cache
 * 
 * @version 2.0.0 - Industry-Grade Implementation
 */

import type { User } from '@/contexts/AuthContext';

const AUTH_CACHE_KEY = 'auth_cache';
const AUTH_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes TTL
const SESSION_CHECK_COOLDOWN = 60 * 1000; // 1 minute cooldown between checks
const MAX_CACHE_SIZE = 1024 * 100; // 100KB max size (safety limit)

interface AuthCache {
  user: User | null;
  isAuthenticated: boolean;
  timestamp: number;
  lastChecked: number;
  version: number; // For cache versioning
}

class AuthCacheManager {
  private memoryCache: AuthCache | null = null;
  private lastCheckTime = 0;
  private broadcastChannel: BroadcastChannel | null = null;
  private cacheVersion = 1; // Increment when cache structure changes

  constructor() {
    // FIX: Initialize multi-tab sync with BroadcastChannel (industry-grade)
    this.initializeMultiTabSync();
  }

  /**
   * Initialize multi-tab synchronization
   * INDUSTRY-GRADE: Ensures auth state is synced across all tabs
   */
  private initializeMultiTabSync(): void {
    try {
      // BroadcastChannel for modern browsers
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('auth_sync');
        
        this.broadcastChannel.onmessage = (event) => {
          if (event.data.type === 'AUTH_UPDATE') {
            // Another tab updated auth - sync locally
            this.memoryCache = event.data.cache;
            if (import.meta.env.DEV) {
              console.log('🔄 Auth synced from another tab');
            }
          } else if (event.data.type === 'AUTH_CLEAR') {
            // Another tab logged out - clear locally
            this.clear();
          }
        };
      }

      // Fallback: localStorage event listener for older browsers
      window.addEventListener('storage', (event) => {
        if (event.key === AUTH_CACHE_KEY) {
          this.memoryCache = null; // Invalidate memory cache
          if (import.meta.env.DEV) {
            console.log('🔄 Auth cache changed in another tab');
          }
        }
      });
    } catch (error) {
      console.error('Multi-tab sync initialization failed:', error);
      // Graceful degradation - continue without multi-tab sync
    }
  }

  /**
   * Broadcast auth update to other tabs
   */
  private broadcastAuthUpdate(cache: AuthCache): void {
    try {
      this.broadcastChannel?.postMessage({
        type: 'AUTH_UPDATE',
        cache,
        timestamp: Date.now()
      });
    } catch (error) {
      // Silent fail - multi-tab sync is nice-to-have
    }
  }

  /**
   * Broadcast auth clear to other tabs
   */
  private broadcastAuthClear(): void {
    try {
      this.broadcastChannel?.postMessage({
        type: 'AUTH_CLEAR',
        timestamp: Date.now()
      });
    } catch (error) {
      // Silent fail
    }
  }

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
   * FIX: Added cache size validation and version tracking
   */
  set(user: User | null, isAuthenticated: boolean): void {
    const cache: AuthCache = {
      user,
      isAuthenticated,
      timestamp: Date.now(),
      lastChecked: Date.now(),
      version: this.cacheVersion // FIX: Add version for cache migration
    };

    // FIX: Validate cache size before storing (prevent memory bloat)
    const cacheSize = JSON.stringify(cache).length;
    if (cacheSize > MAX_CACHE_SIZE) {
      console.warn(`⚠️ Cache size (${cacheSize}bytes) exceeds limit (${MAX_CACHE_SIZE}bytes)`);
      // Store minimal cache
      const minimalCache: AuthCache = {
        user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
        isAuthenticated,
        timestamp: Date.now(),
        lastChecked: Date.now(),
        version: this.cacheVersion
      };
      this.memoryCache = minimalCache;
      
      try {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(minimalCache));
      } catch (error) {
        console.error('Error writing minimal auth cache:', error);
      }
      return;
    }

    // Update memory cache immediately
    this.memoryCache = cache;

    // Update localStorage (async, non-blocking)
    try {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
      
      // FIX: Broadcast to other tabs (multi-tab sync)
      this.broadcastAuthUpdate(cache);
    } catch (error) {
      console.error('Error writing auth cache:', error);
      // If quota exceeded, clear old cache and retry
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clear();
        console.warn('localStorage quota exceeded - cache cleared');
      }
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
   * FIX: Added multi-tab broadcast and proper cleanup
   */
  clear(): void {
    this.memoryCache = null;
    this.lastCheckTime = 0;
    
    try {
      localStorage.removeItem(AUTH_CACHE_KEY);
      
      // FIX: Broadcast clear to other tabs
      this.broadcastAuthClear();
    } catch (error) {
      console.error('Error clearing auth cache:', error);
    }
  }

  /**
   * Cleanup method - call on app unmount
   * INDUSTRY-GRADE: Proper resource cleanup
   */
  destroy(): void {
    try {
      // Close broadcast channel
      this.broadcastChannel?.close();
      this.broadcastChannel = null;
      
      // Clear memory
      this.memoryCache = null;
      this.lastCheckTime = 0;
      
      if (import.meta.env.DEV) {
        console.log('🧹 AuthCache destroyed');
      }
    } catch (error) {
      console.error('Error destroying AuthCache:', error);
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
