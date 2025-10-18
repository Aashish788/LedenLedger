/**
 * React Hook for User Data Service
 * 
 * Provides an easy-to-use React hook for accessing user data throughout your app
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { userDataService, type UserDataResponse } from '@/services/api/userDataService';

/**
 * Hook return type
 */
export interface UseUserDataReturn {
  userData: UserDataResponse | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * React hook for fetching and managing user data
 * 
 * @param autoFetch - Whether to automatically fetch data on mount (default: true)
 * @returns User data and helper functions
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { userData, isLoading, refresh } = useUserData();
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{userData?.data.businessSettings?.business_name}</h1>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserData(autoFetch: boolean = true): UseUserDataReturn {
  const [userData, setUserData] = useState<UserDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted (prevent memory leaks)
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch user data with timeout protection
   */
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);

      // Create a timeout promise (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout - please check your connection and try again'));
        }, 30000); // 30 second timeout
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        userDataService.fetchAllUserData(),
        timeoutPromise
      ]);

      // Clear timeout if request completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      if (response.success) {
        setUserData(response);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch user data');
        console.error('[useUserData] Fetch failed:', response.error);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      // Handle abort errors silently (they're intentional)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useUserData] Request cancelled');
        return;
      }

      const message = err instanceof Error ? err.message : 'Unknown error occurred. Please try again.';
      setError(message);
      console.error('[useUserData] Error fetching data:', err);
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []); // Empty dependency array - function is stable

  /**
   * Refresh data (with refresh flag)
   */
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Refetch data (alias for refresh)
   */
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoFetch]); // Remove fetchData from dependencies to prevent infinite loop

  return {
    userData,
    isLoading,
    isRefreshing,
    error,
    refresh,
    refetch,
  };
}

/**
 * Hook for fetching specific data type
 * 
 * @param dataType - Type of data to fetch
 * @param autoFetch - Whether to automatically fetch on mount
 * 
 * @example
 * ```typescript
 * function CustomerList() {
 *   const { data: customers, isLoading } = useSpecificData('customers');
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   return (
 *     <ul>
 *       {customers?.map(customer => (
 *         <li key={customer.id}>{customer.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useSpecificData<T = any>(
  dataType: 'profile' | 'business' | 'customers' | 'suppliers' | 'invoices' | 'cashBook' | 'staff' | 'transactions',
  autoFetch: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if component is mounted (prevent memory leaks)
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      setError(null);

      // Create a timeout promise (30 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout - please check your connection and try again'));
        }, 30000); // 30 second timeout
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        userDataService.fetchSpecificData(dataType),
        timeoutPromise
      ]);

      // Clear timeout if request completed
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data as T);
        setError(null);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;
      
      // Handle abort errors silently (they're intentional)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`[useSpecificData] Request cancelled for ${dataType}`);
        return;
      }

      const message = err instanceof Error ? err.message : 'Unknown error occurred. Please try again.';
      setError(message);
      setData(null);
      console.error(`[useSpecificData] Error fetching ${dataType}:`, err);
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [dataType]); // Only depend on dataType, not on state

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Fetch data on mount or when dataType changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dataType, autoFetch]); // Remove fetchData from dependencies to prevent infinite loop

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for accessing only customer data
 */
export function useCustomers(autoFetch: boolean = true) {
  return useSpecificData<any[]>('customers', autoFetch);
}

/**
 * Hook for accessing only supplier data
 */
export function useSuppliers(autoFetch: boolean = true) {
  return useSpecificData<any[]>('suppliers', autoFetch);
}

/**
 * Hook for accessing only invoice data
 */
export function useInvoices(autoFetch: boolean = true) {
  return useSpecificData<any[]>('invoices', autoFetch);
}

/**
 * Hook for accessing only cash book data
 */
export function useCashBook(autoFetch: boolean = true) {
  return useSpecificData<any[]>('cashBook', autoFetch);
}

/**
 * Hook for accessing only staff data
 */
export function useStaff(autoFetch: boolean = true) {
  return useSpecificData<any[]>('staff', autoFetch);
}

/**
 * Hook for accessing only transactions data
 */
export function useTransactions(autoFetch: boolean = true) {
  return useSpecificData<any[]>('transactions', autoFetch);
}

/**
 * Hook for accessing only business settings
 */
export function useBusinessSettings(autoFetch: boolean = true) {
  return useSpecificData<any>('business', autoFetch);
}

/**
 * Hook for accessing only user profile
 */
export function useUserProfile(autoFetch: boolean = true) {
  return useSpecificData<any>('profile', autoFetch);
}

// Export all hooks
export default useUserData;
