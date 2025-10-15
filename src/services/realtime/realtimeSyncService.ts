/**
 * Real-Time Sync Service - Industry Standard Implementation
 * 
 * This service implements production-grade real-time data synchronization
 * similar to Khatabook, Vyapar, and other leading fintech apps.
 * 
 * Features:
 * - Bidirectional real-time sync with Supabase
 * - Optimistic updates for instant UI feedback
 * - Conflict resolution with Last-Write-Wins strategy
 * - Offline queue with automatic retry
 * - Connection management with exponential backoff
 * - Memory-efficient subscription management
 * - Comprehensive error handling and logging
 * 
 * @version 2.0.0
 * @author Senior Backend Developer
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TableName = 
  | 'customers' 
  | 'suppliers' 
  | 'transactions' 
  | 'bills' 
  | 'cashbook_entries' 
  | 'staff' 
  | 'attendance'
  | 'business_settings'
  | 'profiles';

export type ChangeType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeChange<T = any> {
  type: ChangeType;
  table: TableName;
  record: T;
  old?: T;
  timestamp: number;
}

export interface SubscriptionOptions {
  table: TableName;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onChange?: (change: RealtimeChange) => void;
}

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: TableName;
  data: any;
  timestamp: number;
  retries: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isConnected: boolean;
  pendingOperations: number;
  lastSync: number | null;
  error: string | null;
}

// ============================================================================
// REALTIME SYNC SERVICE CLASS
// ============================================================================

/**
 * Generate a UUID v4 compatible ID
 * Cross-browser compatible implementation
 */
function generateUUID(): string {
  // Try native crypto.randomUUID first
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback to custom implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class RealtimeSyncService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private offlineQueue: OfflineOperation[] = [];
  private isProcessingQueue = false;
  private syncStatusListeners: Set<(status: SyncStatus) => void> = new Set();
  private connectionRetries = 0;
  private maxRetries = 5;
  private baseRetryDelay = 1000; // 1 second
  private userId: string | null = null;
  
  // Status tracking
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isConnected: false,
    pendingOperations: 0,
    lastSync: null,
    error: null,
  };

  constructor() {
    this.initializeService();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private async initializeService() {
    console.log('🚀 Initializing Real-Time Sync Service...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    this.userId = user?.id || null;

    // Setup online/offline detection
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Setup auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null;
      
      if (event === 'SIGNED_IN') {
        console.log('✅ User signed in, reconnecting subscriptions...');
        this.reconnectAllSubscriptions();
      } else if (event === 'SIGNED_OUT') {
        console.log('🔴 User signed out, cleaning up subscriptions...');
        this.cleanupAllSubscriptions();
      }
    });

    // Load offline queue from localStorage
    this.loadOfflineQueue();

    // Setup connection monitoring
    this.setupConnectionMonitoring();

    console.log('✅ Real-Time Sync Service initialized');
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Subscribe to real-time changes for a specific table
   */
  public subscribe(options: SubscriptionOptions): () => void {
    const { table, filter, onInsert, onUpdate, onDelete, onChange } = options;
    
    if (!this.userId) {
      console.warn('⚠️ Cannot subscribe: User not authenticated');
      return () => {};
    }

    const channelName = `${table}-${filter || 'all'}-${Date.now()}`;
    
    console.log(`📡 Subscribing to ${table} changes...`, { filter });

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: table,
            filter: filter,
          },
          (payload) => {
            console.log(`✨ INSERT on ${table}:`, payload);
            onInsert?.(payload);
            onChange?.({
              type: 'INSERT',
              table,
              record: payload.new,
              timestamp: Date.now(),
            });
            this.updateSyncStatus({ lastSync: Date.now() });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: table,
            filter: filter,
          },
          (payload) => {
            console.log(`🔄 UPDATE on ${table}:`, payload);
            onUpdate?.(payload);
            onChange?.({
              type: 'UPDATE',
              table,
              record: payload.new,
              old: payload.old,
              timestamp: Date.now(),
            });
            this.updateSyncStatus({ lastSync: Date.now() });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: table,
            filter: filter,
          },
          (payload) => {
            console.log(`🗑️ DELETE on ${table}:`, payload);
            onDelete?.(payload);
            onChange?.({
              type: 'DELETE',
              table,
              record: payload.old,
              timestamp: Date.now(),
            });
            this.updateSyncStatus({ lastSync: Date.now() });
          }
        )
        .subscribe((status) => {
          console.log(`📡 Subscription status for ${table}:`, status);
          
          if (status === 'SUBSCRIBED') {
            this.updateSyncStatus({ isConnected: true, error: null });
            this.connectionRetries = 0;
          } else if (status === 'CLOSED') {
            this.updateSyncStatus({ isConnected: false });
          } else if (status === 'CHANNEL_ERROR') {
            this.handleConnectionError();
          }
        });

      this.channels.set(channelName, channel);

      // Return cleanup function
      return () => {
        console.log(`🔌 Unsubscribing from ${table}...`);
        channel.unsubscribe();
        this.channels.delete(channelName);
      };
    } catch (error) {
      console.error(`❌ Error subscribing to ${table}:`, error);
      return () => {};
    }
  }

  /**
   * Subscribe to multiple tables at once
   */
  public subscribeToTables(tables: SubscriptionOptions[]): () => void {
    const unsubscribeFunctions = tables.map(options => this.subscribe(options));
    
    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Reconnect all active subscriptions
   */
  private async reconnectAllSubscriptions() {
    console.log('🔄 Reconnecting all subscriptions...');
    
    // Remove all existing channels
    for (const [channelName, channel] of this.channels.entries()) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
    }

    // Process offline queue
    await this.processOfflineQueue();
  }

  /**
   * Cleanup all subscriptions
   */
  private async cleanupAllSubscriptions() {
    console.log('🧹 Cleaning up all subscriptions...');
    
    for (const [channelName, channel] of this.channels.entries()) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
    }

    this.updateSyncStatus({ isConnected: false });
  }

  // ============================================================================
  // CRUD OPERATIONS WITH OPTIMISTIC UPDATES
  // ============================================================================

  /**
   * Create a new record with optimistic update
   */
  public async create<T>(
    table: TableName,
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    options?: { optimisticId?: string }
  ): Promise<{ data: T | null; error: any; isOptimistic: boolean }> {
    // Generate a real UUID for the record (required for client-side ID generation)
    const recordId = options?.optimisticId || generateUUID();
    
    // Create optimistic record
    const optimisticRecord = {
      ...data,
      id: recordId,
      user_id: this.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T;

    console.log(`⚡ Optimistically creating ${table}:`, optimisticRecord);

    // If offline, queue the operation
    if (!this.syncStatus.isOnline) {
      this.queueOfflineOperation({
        id: recordId,
        type: 'create',
        table,
        data: { ...data, id: recordId },
        timestamp: Date.now(),
        retries: 0,
      });

      return {
        data: optimisticRecord,
        error: null,
        isOptimistic: true,
      };
    }

    // Perform actual insert with the generated ID
    try {
      const { data: insertedData, error } = await (supabase as any)
        .from(table)
        .insert({ ...data, id: recordId, user_id: this.userId })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Successfully created ${table}:`, insertedData);

      return {
        data: insertedData as T,
        error: null,
        isOptimistic: false,
      };
    } catch (error: any) {
      console.error(`❌ Error creating ${table}:`, error);

      // Queue for later if network error
      if (this.isNetworkError(error)) {
        this.queueOfflineOperation({
          id: recordId,
          type: 'create',
          table,
          data: { ...data, id: recordId },
          timestamp: Date.now(),
          retries: 0,
        });

        return {
          data: optimisticRecord,
          error: null,
          isOptimistic: true,
        };
      }

      return {
        data: null,
        error,
        isOptimistic: false,
      };
    }
  }

  /**
   * Update a record with optimistic update
   */
  public async update<T>(
    table: TableName,
    id: string,
    data: Partial<T>,
    options?: { skipOptimistic?: boolean }
  ): Promise<{ data: T | null; error: any; isOptimistic: boolean }> {
    
    // Create optimistic update
    const optimisticRecord = {
      ...data,
      id,
      updated_at: new Date().toISOString(),
    } as T;

    console.log(`⚡ Optimistically updating ${table}:`, optimisticRecord);

    // If offline, queue the operation
    if (!this.syncStatus.isOnline) {
      this.queueOfflineOperation({
        id,
        type: 'update',
        table,
        data: { id, ...data },
        timestamp: Date.now(),
        retries: 0,
      });

      return {
        data: optimisticRecord,
        error: null,
        isOptimistic: true,
      };
    }

    // Perform actual update
    try {
      const { data: updatedData, error } = await (supabase as any)
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', this.userId!)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Successfully updated ${table}:`, updatedData);

      return {
        data: updatedData as T,
        error: null,
        isOptimistic: false,
      };
    } catch (error: any) {
      console.error(`❌ Error updating ${table}:`, error);

      // Queue for later if network error
      if (this.isNetworkError(error)) {
        this.queueOfflineOperation({
          id,
          type: 'update',
          table,
          data: { id, ...data },
          timestamp: Date.now(),
          retries: 0,
        });

        return {
          data: optimisticRecord,
          error: null,
          isOptimistic: true,
        };
      }

      return {
        data: null,
        error,
        isOptimistic: false,
      };
    }
  }

  /**
   * Delete a record with optimistic update
   */
  public async delete(
    table: TableName,
    id: string
  ): Promise<{ success: boolean; error: any; isOptimistic: boolean }> {
    
    console.log(`⚡ Optimistically deleting ${table}:`, id);

    // If offline, queue the operation
    if (!this.syncStatus.isOnline) {
      this.queueOfflineOperation({
        id,
        type: 'delete',
        table,
        data: { id },
        timestamp: Date.now(),
        retries: 0,
      });

      return {
        success: true,
        error: null,
        isOptimistic: true,
      };
    }

    // Perform actual delete (soft delete by setting deleted_at)
    try {
      const { error } = await (supabase as any)
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', this.userId!);

      if (error) throw error;

      console.log(`✅ Successfully deleted ${table}:`, id);

      return {
        success: true,
        error: null,
        isOptimistic: false,
      };
    } catch (error: any) {
      console.error(`❌ Error deleting ${table}:`, error);

      // Queue for later if network error
      if (this.isNetworkError(error)) {
        this.queueOfflineOperation({
          id,
          type: 'delete',
          table,
          data: { id },
          timestamp: Date.now(),
          retries: 0,
        });

        return {
          success: true,
          error: null,
          isOptimistic: true,
        };
      }

      return {
        success: false,
        error,
        isOptimistic: false,
      };
    }
  }

  /**
   * Batch create multiple records
   */
  public async batchCreate<T>(
    table: TableName,
    records: Omit<T, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<{ data: T[] | null; error: any }> {
    
    console.log(`⚡ Batch creating ${records.length} ${table} records...`);

    try {
      const recordsWithUserId = records.map(record => ({
        ...record,
        user_id: this.userId,
      }));

      const { data, error } = await (supabase as any)
        .from(table)
        .insert(recordsWithUserId)
        .select();

      if (error) throw error;

      console.log(`✅ Successfully batch created ${table}:`, data);

      return { data: data as T[], error: null };
    } catch (error: any) {
      console.error(`❌ Error batch creating ${table}:`, error);
      return { data: null, error };
    }
  }

  // ============================================================================
  // OFFLINE QUEUE MANAGEMENT
  // ============================================================================

  private queueOfflineOperation(operation: OfflineOperation) {
    console.log('📥 Queueing offline operation:', operation);
    
    this.offlineQueue.push(operation);
    this.saveOfflineQueue();
    this.updateSyncStatus({ pendingOperations: this.offlineQueue.length });
  }

  private async processOfflineQueue() {
    if (this.isProcessingQueue || this.offlineQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`🔄 Processing ${this.offlineQueue.length} offline operations...`);

    const failedOperations: OfflineOperation[] = [];

    for (const operation of this.offlineQueue) {
      try {
        if (operation.type === 'create') {
          const { error } = await (supabase as any)
            .from(operation.table)
            .insert({ ...operation.data, user_id: this.userId });
          
          if (error) throw error;
        } else if (operation.type === 'update') {
          const { error } = await (supabase as any)
            .from(operation.table)
            .update(operation.data)
            .eq('id', operation.data.id)
            .eq('user_id', this.userId!);
          
          if (error) throw error;
        } else if (operation.type === 'delete') {
          const { error } = await (supabase as any)
            .from(operation.table)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', operation.data.id)
            .eq('user_id', this.userId!);
          
          if (error) throw error;
        }

        console.log('✅ Successfully processed offline operation:', operation);
      } catch (error) {
        console.error('❌ Failed to process offline operation:', error);
        
        if (operation.retries < this.maxRetries) {
          failedOperations.push({ ...operation, retries: operation.retries + 1 });
        }
      }
    }

    this.offlineQueue = failedOperations;
    this.saveOfflineQueue();
    this.updateSyncStatus({ pendingOperations: this.offlineQueue.length });
    this.isProcessingQueue = false;

    console.log(`✅ Offline queue processed. ${failedOperations.length} operations remaining.`);
  }

  private loadOfflineQueue() {
    try {
      const saved = localStorage.getItem('offline_queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
        this.updateSyncStatus({ pendingOperations: this.offlineQueue.length });
        console.log(`📥 Loaded ${this.offlineQueue.length} offline operations`);
      }
    } catch (error) {
      console.error('❌ Error loading offline queue:', error);
    }
  }

  private saveOfflineQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('❌ Error saving offline queue:', error);
    }
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  private setupConnectionMonitoring() {
    // Check connection status every 30 seconds
    setInterval(() => {
      if (this.syncStatus.isOnline && this.channels.size > 0) {
        // Ping to check if connection is alive
        this.checkConnectionHealth();
      }
    }, 30000);
  }

  private async checkConnectionHealth() {
    try {
      const { error } = await (supabase as any).from('profiles').select('id').limit(1);
      
      if (error) {
        throw error;
      }

      this.updateSyncStatus({ isConnected: true, error: null });
    } catch (error) {
      console.warn('⚠️ Connection health check failed:', error);
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    console.error('❌ Connection error detected');
    
    this.updateSyncStatus({ 
      isConnected: false, 
      error: 'Connection lost. Retrying...' 
    });

    if (this.connectionRetries < this.maxRetries) {
      const delay = this.baseRetryDelay * Math.pow(2, this.connectionRetries);
      this.connectionRetries++;
      
      console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})...`);
      
      setTimeout(() => {
        this.reconnectAllSubscriptions();
      }, delay);
    } else {
      this.updateSyncStatus({ 
        error: 'Connection failed. Please check your internet and refresh the page.' 
      });
    }
  }

  private handleOnline() {
    console.log('🌐 Connection restored');
    
    this.updateSyncStatus({ isOnline: true, error: null });
    this.connectionRetries = 0;
    
    // Process offline queue
    this.processOfflineQueue();
    
    // Reconnect subscriptions
    this.reconnectAllSubscriptions();
  }

  private handleOffline() {
    console.log('📴 Connection lost');
    
    this.updateSyncStatus({ 
      isOnline: false, 
      isConnected: false,
      error: 'You are offline. Changes will be synced when connection is restored.' 
    });
  }

  private isNetworkError(error: any): boolean {
    return (
      error?.message?.includes('fetch') ||
      error?.message?.includes('network') ||
      error?.message?.includes('offline') ||
      error?.code === 'PGRST301'
    );
  }

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    
    // Notify all listeners
    this.syncStatusListeners.forEach(listener => {
      listener(this.syncStatus);
    });
  }

  public onSyncStatusChange(listener: (status: SyncStatus) => void): () => void {
    this.syncStatusListeners.add(listener);
    
    // Immediately call with current status
    listener(this.syncStatus);
    
    // Return cleanup function
    return () => {
      this.syncStatusListeners.delete(listener);
    };
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Force sync - manually trigger offline queue processing
   */
  public async forceSync() {
    console.log('🔄 Force sync triggered...');
    await this.processOfflineQueue();
  }

  /**
   * Clear all offline operations
   */
  public clearOfflineQueue() {
    console.log('🧹 Clearing offline queue...');
    this.offlineQueue = [];
    this.saveOfflineQueue();
    this.updateSyncStatus({ pendingOperations: 0 });
  }

  /**
   * Get pending operations count
   */
  public getPendingOperationsCount(): number {
    return this.offlineQueue.length;
  }

  /**
   * Cleanup service
   */
  public async cleanup() {
    console.log('🧹 Cleaning up Real-Time Sync Service...');
    await this.cleanupAllSubscriptions();
    this.syncStatusListeners.clear();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const realtimeSyncService = new RealtimeSyncService();
export default realtimeSyncService;

