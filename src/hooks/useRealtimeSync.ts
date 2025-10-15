/**
 * useRealtimeSync Hook - React Integration for Real-Time Sync
 * 
 * This hook provides React components with easy access to real-time
 * data synchronization capabilities.
 * 
 * Features:
 * - Automatic subscription management
 * - Optimistic updates
 * - Loading and error states
 * - Automatic cleanup
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeSyncService, type TableName, type SubscriptionOptions, type SyncStatus } from '@/services/realtime/realtimeSyncService';

// ============================================================================
// HOOK: useRealtimeSync
// ============================================================================

interface UseRealtimeSyncOptions extends Omit<SubscriptionOptions, 'table'> {
  enabled?: boolean;
}

export function useRealtimeSync<T = any>(
  table: TableName,
  options?: UseRealtimeSyncOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const { enabled = true, filter, onInsert, onUpdate, onDelete, onChange } = options || {};

  useEffect(() => {
    if (!enabled) return;

    console.log(`🎣 useRealtimeSync: Setting up subscription for ${table}`);

    // Subscribe to real-time changes
    const unsubscribe = realtimeSyncService.subscribe({
      table,
      filter,
      onInsert: (payload) => {
        console.log(`📥 New ${table}:`, payload.new);
        setData(prev => [payload.new as T, ...prev]);
        onInsert?.(payload);
      },
      onUpdate: (payload) => {
        console.log(`🔄 Updated ${table}:`, payload.new);
        setData(prev => prev.map(item => 
          (item as any).id === payload.new.id ? payload.new as T : item
        ));
        onUpdate?.(payload);
      },
      onDelete: (payload) => {
        console.log(`🗑️ Deleted ${table}:`, payload.old);
        setData(prev => prev.filter(item => (item as any).id !== (payload.old as any).id));
        onDelete?.(payload);
      },
      onChange,
    });

    unsubscribeRef.current = unsubscribe;
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      console.log(`🔌 useRealtimeSync: Cleaning up subscription for ${table}`);
      unsubscribe();
    };
  }, [table, filter, enabled]);

  return {
    data,
    setData, // Allow manual data updates
    isLoading,
    error,
  };
}

// ============================================================================
// HOOK: useRealtimeCRUD
// ============================================================================

interface UseRealtimeCRUDResult<T> {
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T | null>;
  update: (id: string, data: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  batchCreate: (records: Omit<T, 'id' | 'created_at' | 'updated_at'>[]) => Promise<T[] | null>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: Error | null;
}

export function useRealtimeCRUD<T = any>(table: TableName): UseRealtimeCRUDResult<T> {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await realtimeSyncService.create<T>(table, data);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to create record');
      }

      return result.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`❌ Error creating ${table}:`, error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [table]);

  const update = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    setIsUpdating(true);
    setError(null);

    try {
      const result = await realtimeSyncService.update<T>(table, id, data);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to update record');
      }

      return result.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`❌ Error updating ${table}:`, error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [table]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await realtimeSyncService.delete(table, id);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to delete record');
      }

      return result.success;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`❌ Error deleting ${table}:`, error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [table]);

  const batchCreate = useCallback(async (records: Omit<T, 'id' | 'created_at' | 'updated_at'>[]): Promise<T[] | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await realtimeSyncService.batchCreate<T>(table, records);
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to batch create records');
      }

      return result.data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error(`❌ Error batch creating ${table}:`, error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [table]);

  return {
    create,
    update,
    remove,
    batchCreate,
    isCreating,
    isUpdating,
    isDeleting,
    error,
  };
}

// ============================================================================
// HOOK: useSyncStatus
// ============================================================================

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(realtimeSyncService.getSyncStatus());

  useEffect(() => {
    const unsubscribe = realtimeSyncService.onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  const forceSync = useCallback(() => {
    realtimeSyncService.forceSync();
  }, []);

  const clearQueue = useCallback(() => {
    realtimeSyncService.clearOfflineQueue();
  }, []);

  return {
    syncStatus,
    forceSync,
    clearQueue,
  };
}

// ============================================================================
// HOOK: useRealtimeData (Combined Hook)
// ============================================================================

interface UseRealtimeDataOptions {
  filter?: string;
  enabled?: boolean;
}

export function useRealtimeData<T = any>(
  table: TableName,
  options?: UseRealtimeDataOptions
) {
  const { data, setData, isLoading, error: syncError } = useRealtimeSync<T>(table, options);
  const { create, update, remove, batchCreate, isCreating, isUpdating, isDeleting, error: crudError } = useRealtimeCRUD<T>(table);

  return {
    // Data
    data,
    setData,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Operations
    create,
    update,
    remove,
    batchCreate,
    
    // Error
    error: syncError || crudError,
  };
}
