/**
 * Suppliers Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for suppliers with:
 * - Real-time bidirectional sync
 * - Optimistic updates
 * - Offline support
 * - Full type safety
 * 
 * @version 2.0.0
 * @author Senior Backend Engineer
 */

import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Supplier {
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

export interface CreateSupplierInput {
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

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  amount?: number;
  email?: string;
  address?: string;
  business_type?: string;
  gst_number?: string;
  payment_terms?: string;
  notes?: string;
}

export interface FetchSuppliersOptions {
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'name' | 'created_at' | 'amount';
  orderDirection?: 'asc' | 'desc';
}

// ============================================================================
// SUPPLIERS SERVICE
// ============================================================================

class SuppliersService {
  private tableName = 'suppliers' as const;

  /**
   * Fetch suppliers with optional filtering and pagination
   */
  async fetchSuppliers(options?: FetchSuppliersOptions): Promise<{
    data: Supplier[] | null;
    error: any;
    count: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
          count: 0,
        };
      }

      let query = (supabase as any)
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .is('deleted_at', null);

      // Apply search filter
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,phone.ilike.%${options.search}%,email.ilike.%${options.search}%`
        );
      }

      // Apply ordering
      const orderBy = options?.orderBy || 'created_at';
      const orderDirection = options?.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching suppliers:', error);
        return { data: null, error, count: 0 };
      }

      console.log(`✅ Fetched ${data?.length || 0} suppliers`);
      return { data: data as Supplier[], error: null, count: count || 0 };
    } catch (err) {
      console.error('❌ Exception in fetchSuppliers:', err);
      return { data: null, error: err, count: 0 };
    }
  }

  /**
   * Fetch a single supplier by ID
   */
  async fetchSupplierById(id: string): Promise<{
    data: Supplier | null;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
        };
      }

      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('❌ Error fetching supplier:', error);
        return { data: null, error };
      }

      return { data: data as Supplier, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchSupplierById:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Create a new supplier with real-time sync
   */
  async createSupplier(input: CreateSupplierInput): Promise<{
    data: Supplier | null;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
        };
      }

      const supplierData = {
        ...input,
        user_id: user.id,
        amount: input.amount || 0,
        deleted_at: null,
        last_transaction: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating supplier with real-time sync:', supplierData);

      const result = await realtimeSyncService.create<Supplier>(
        this.tableName,
        supplierData as any
      );

      if (result.error) {
        console.error('❌ Error creating supplier:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Supplier created successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createSupplier:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update an existing supplier with real-time sync
   */
  async updateSupplier(id: string, input: UpdateSupplierInput): Promise<{
    data: Supplier | null;
    error: any;
  }> {
    try {
      const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🔄 Updating supplier with real-time sync:', id, updateData);

      const result = await realtimeSyncService.update<Supplier>(
        this.tableName,
        id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating supplier:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Supplier updated successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateSupplier:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete a supplier (soft delete) with real-time sync
   */
  async deleteSupplier(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      console.log('🗑️ Deleting supplier with real-time sync:', id);

      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        console.error('❌ Error deleting supplier:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Supplier deleted successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in deleteSupplier:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Batch create suppliers with real-time sync
   */
  async batchCreateSuppliers(suppliers: CreateSupplierInput[]): Promise<{
    data: Supplier[] | null;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          data: null,
          error: { message: 'User not authenticated' },
        };
      }

      const suppliersData = suppliers.map(supplier => ({
        ...supplier,
        user_id: user.id,
        amount: supplier.amount || 0,
        deleted_at: null,
        last_transaction: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      }));

      console.log(`🚀 Batch creating ${suppliersData.length} suppliers`);

      const result = await realtimeSyncService.batchCreate<Supplier>(
        this.tableName,
        suppliersData as any
      );

      if (result.error) {
        console.error('❌ Error batch creating suppliers:', result.error);
        return { data: null, error: result.error };
      }

      console.log(`✅ ${result.data?.length || 0} suppliers created successfully`);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in batchCreateSuppliers:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update supplier balance
   */
  async updateSupplierBalance(
    supplierId: string,
    amount: number,
    type: 'increase' | 'decrease'
  ): Promise<{ success: boolean; error: any }> {
    try {
      const { data: supplier, error: fetchError } = await this.fetchSupplierById(supplierId);
      
      if (fetchError || !supplier) {
        return { success: false, error: fetchError || new Error('Supplier not found') };
      }

      const newAmount = type === 'increase' 
        ? supplier.amount + amount 
        : supplier.amount - amount;

      const { error: updateError } = await this.updateSupplier(supplierId, {
        amount: newAmount,
      });

      if (updateError) {
        return { success: false, error: updateError };
      }

      console.log(`✅ Supplier balance updated: ${supplier.amount} → ${newAmount}`);
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in updateSupplierBalance:', err);
      return { success: false, error: err };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const suppliersService = new SuppliersService();
