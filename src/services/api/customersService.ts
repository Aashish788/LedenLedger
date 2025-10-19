/**
 * Customers Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for customers with:
 * - Real-time bidirectional sync
 * - Optimistic updates
 * - Offline support
 * - Full type safety
 * - AbortController support to prevent memory leaks
 * 
 * @version 2.1.0
 */

import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { supabase } from '@/integrations/supabase/client';
import { withAbortController, isAbortError } from '@/lib/abortController';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  amount: number;
  last_transaction: string | null;
  email: string | null;
  address: string | null;
  business_type: string | null;
  gst_number: string | null;
  payment_terms: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  amount?: number;
  email?: string;
  address?: string;
  business_type?: string;
  gst_number?: string;
  payment_terms?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  amount?: number;
  email?: string;
  address?: string;
  business_type?: string;
  gst_number?: string;
  payment_terms?: string;
  notes?: string;
  last_transaction?: string;
}

// ============================================================================
// CUSTOMERS SERVICE
// ============================================================================

class CustomersService {
  private tableName = 'customers' as const;

  /**
   * Fetch all customers for the current user
   * FIX: Added AbortSignal support to prevent memory leaks
   */
  async fetchCustomers(options?: {
    limit?: number;
    offset?: number;
    searchQuery?: string;
    signal?: AbortSignal; // FIX: Add abort support
  }): Promise<{ data: Customer[] | null; error: any; count: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = (supabase as any)
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (options?.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,phone.ilike.%${options.searchQuery}%`);
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // FIX: Wrap with AbortController support
      const result = options?.signal 
        ? await withAbortController(query, options.signal)
        : await query;
      
      const { data, error, count } = result;

      if (error) throw error;

      return {
        data: data as Customer[],
        error: null,
        count: count || 0,
      };
    } catch (error: any) {
      // FIX: Don't log aborted requests as errors
      if (isAbortError(error)) {
        return { data: null, error: null, count: 0 };
      }
      
      console.error('❌ Error fetching customers:', error);
      return {
        data: null,
        error,
        count: 0,
      };
    }
  }

  /**
   * Fetch a single customer by ID
   * FIX: Added AbortSignal support to prevent memory leaks
   */
  async fetchCustomerById(
    id: string, 
    signal?: AbortSignal // FIX: Add abort support
  ): Promise<{ data: Customer | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const query = (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      // FIX: Wrap with AbortController support
      const result = signal 
        ? await withAbortController(query, signal)
        : await query;
      
      const { data, error } = result;

      if (error) throw error;

      return {
        data: data as Customer,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error fetching customer:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * Create a new customer with real-time sync
   */
  async createCustomer(input: CreateCustomerInput): Promise<{ data: Customer | null; error: any }> {
    try {
      const result = await realtimeSyncService.create<Customer>(
        this.tableName,
        {
          ...input,
          amount: input.amount || 0,
          synced_at: new Date().toISOString(),
          deleted_at: null,
          last_transaction: null,
        } as any
      );

      if (result.error) {
        throw result.error;
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error creating customer:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * Update a customer with real-time sync
   */
  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<{ data: Customer | null; error: any }> {
    try {
      const result = await realtimeSyncService.update<Customer>(
        this.tableName,
        id,
        {
          ...input,
          synced_at: new Date().toISOString(),
        }
      );

      if (result.error) {
        throw result.error;
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error updating customer:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * Delete a customer (soft delete) with real-time sync
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        throw result.error;
      }

      return {
        success: result.success,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error deleting customer:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Batch create customers
   */
  async batchCreateCustomers(customers: CreateCustomerInput[]): Promise<{ data: Customer[] | null; error: any }> {
    try {
      const customersWithDefaults = customers.map(customer => ({
        ...customer,
        amount: customer.amount || 0,
        synced_at: new Date().toISOString(),
        deleted_at: null,
        last_transaction: null,
      }));

      const result = await realtimeSyncService.batchCreate<Customer>(
        this.tableName,
        customersWithDefaults as any
      );

      if (result.error) {
        throw result.error;
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error batch creating customers:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * Update customer balance after transaction
   * FIX: CRITICAL - Use database-level atomic operation to prevent race conditions
   * 
   * Previously: fetch customer → calculate → update (3 operations, non-atomic)
   * Now: Single UPDATE with WHERE condition (1 atomic operation)
   */
  async updateCustomerBalance(
    customerId: string, 
    transactionAmount: number, 
    transactionType: 'gave' | 'got'
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // FIX: CRITICAL - Use database-level atomic UPDATE with increment/decrement
      // This prevents race conditions where multiple transactions update the same customer
      // The database will handle the calculation atomically
      
      const amountDelta = transactionType === 'gave' ? transactionAmount : -transactionAmount;
      
      // Use PostgreSQL RPC function for atomic balance update
      const { data, error } = await (supabase as any).rpc('update_customer_balance_atomic', {
        p_customer_id: customerId,
        p_user_id: user.id,
        p_amount_delta: amountDelta,
        p_last_transaction: new Date().toISOString()
      });

      if (error) {
        // If RPC function doesn't exist, fall back to optimistic locking
        console.warn('⚠️ RPC function not found, using optimistic locking fallback');
        return await this.updateCustomerBalanceWithOptimisticLocking(customerId, transactionAmount, transactionType);
      }

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error updating customer balance:', error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Fallback method with optimistic locking (version-based concurrency control)
   * FIX: Uses updated_at as version field for detecting concurrent updates
   */
  private async updateCustomerBalanceWithOptimisticLocking(
    customerId: string,
    transactionAmount: number,
    transactionType: 'gave' | 'got'
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch customer with current version (updated_at)
      const { data: customer, error: fetchError } = await (supabase as any)
        .from(this.tableName)
        .select('id, amount, updated_at')
        .eq('id', customerId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !customer) {
        throw fetchError || new Error('Customer not found');
      }

      const currentVersion = customer.updated_at;
      
      // Calculate new balance
      const amountDelta = transactionType === 'gave' ? transactionAmount : -transactionAmount;
      const newAmount = customer.amount + amountDelta;

      // Update with optimistic lock - only succeeds if updated_at hasn't changed
      const { data: updatedCustomer, error: updateError } = await (supabase as any)
        .from(this.tableName)
        .update({
          amount: newAmount,
          last_transaction: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('user_id', user.id)
        .eq('updated_at', currentVersion) // Optimistic lock condition
        .select()
        .single();

      if (updateError) {
        // Check if it's a concurrency conflict
        if (updateError.code === 'PGRST116') {
          throw new Error('CONCURRENCY_CONFLICT: Balance was updated by another transaction. Please retry.');
        }
        throw updateError;
      }

      if (!updatedCustomer) {
        // No rows affected = concurrent update detected
        throw new Error('CONCURRENCY_CONFLICT: Balance was updated by another transaction. Please retry.');
      }

      return {
        success: true,
        error: null,
      }

      return {
        success: true,
        error: null,
      };
    } catch (error: any) {
      console.error('❌ Error updating customer balance:', error);
      return {
        success: false,
        error,
      };
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const customersService = new CustomersService();
export default customersService;
