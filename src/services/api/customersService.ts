/**
 * Customers Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for customers with:
 * - Real-time bidirectional sync
 * - Optimistic updates
 * - Offline support
 * - Full type safety
 * 
 * @version 2.0.0
 */

import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { supabase } from '@/integrations/supabase/client';

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
   */
  async fetchCustomers(options?: {
    limit?: number;
    offset?: number;
    searchQuery?: string;
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

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data as Customer[],
        error: null,
        count: count || 0,
      };
    } catch (error: any) {
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
   */
  async fetchCustomerById(id: string): Promise<{ data: Customer | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

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
   */
  async updateCustomerBalance(
    customerId: string, 
    transactionAmount: number, 
    transactionType: 'gave' | 'got'
  ): Promise<{ success: boolean; error: any }> {
    try {
      // Fetch current customer
      const { data: customer, error: fetchError } = await this.fetchCustomerById(customerId);
      
      if (fetchError || !customer) {
        throw fetchError || new Error('Customer not found');
      }

      // Calculate new balance
      let newAmount = customer.amount;
      if (transactionType === 'gave') {
        // Customer owes more (they received money/goods)
        newAmount += transactionAmount;
      } else {
        // Customer owes less (they paid)
        newAmount -= transactionAmount;
      }

      // Update customer
      const { error: updateError } = await this.updateCustomer(customerId, {
        amount: newAmount,
        last_transaction: new Date().toISOString(),
      });

      if (updateError) {
        throw updateError;
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
