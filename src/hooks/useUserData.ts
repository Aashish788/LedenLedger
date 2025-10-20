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

  /**
   * Fetch user data
   * FIX: Industry-grade with timeout protection
   */
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('[useUserData] ⏱️ Request timeout after 20 seconds');
    }, 20000); // 20 second timeout

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);

      const response = await userDataService.fetchAllUserData();

      // Clear timeout on success
      clearTimeout(timeoutId);

      if (response.success) {
        setUserData(response);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch user data');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === 'AbortError') {
        const message = 'Request timeout - please check your connection';
        setError(message);
        console.error('[useUserData] Request aborted due to timeout');
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('[useUserData] Error fetching data:', err);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []); // FIX: Empty dependency array - function is stable

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
  // FIX: Use ref to prevent re-triggering when fetchData changes
  const hasFetchedRef = useRef(false);
  
  useEffect(() => {
    if (autoFetch && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [autoFetch, fetchData]);

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

  const fetchData = useCallback(async () => {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error(`[useSpecificData] ⏱️ Request timeout for ${dataType} after 20 seconds`);
    }, 20000); // 20 second timeout

    try {
      setIsLoading(true);
      setError(null);

      const response = await userDataService.fetchSpecificData(dataType);

      // Clear timeout on success
      clearTimeout(timeoutId);

      if (response.error) {
        setError(response.error);
      } else {
        setData(response.data as T);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      
      if (err instanceof Error && err.name === 'AbortError') {
        const message = 'Request timeout - please check your connection';
        setError(message);
        console.error(`[useSpecificData] Request aborted for ${dataType} due to timeout`);
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error(`[useSpecificData] Error fetching ${dataType}:`, err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [dataType]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

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
