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
   * CRITICAL FIX: Ensure session is ready before fetching
   */
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      setError(null);

      // CRITICAL FIX: Ensure session is initialized before fetching data
      const { ensureSessionReady } = await import('@/integrations/supabase/client');
      await ensureSessionReady();

      const response = await userDataService.fetchAllUserData();

      if (response.success) {
        setUserData(response);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch user data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useUserData] Error fetching data:', err);
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
    try {
      setIsLoading(true);
      setError(null);

      const response = await userDataService.fetchSpecificData(dataType);

      if (response.error) {
        setError(response.error);
      } else {
        setData(response.data as T);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error(`[useSpecificData] Error fetching ${dataType}:`, err);
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
