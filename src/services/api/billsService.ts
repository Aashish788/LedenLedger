/**
 * Bills/Invoices Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for bills/invoices with:
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

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Bill {
  id: string;
  user_id: string;
  bill_number: string;
  party_id: string;
  party_type: 'customer' | 'supplier';
  party_name: string;
  date: string;
  due_date: string | null;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: BillItem[];
  notes: string | null;
  terms: string | null;
  tax_amount: number;
  discount_amount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface BillItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percentage: number;
  total: number;
}

export interface CreateBillInput {
  bill_number?: string;
  party_id: string;
  party_type: 'customer' | 'supplier';
  party_name: string;
  date: string;
  due_date?: string;
  items: Omit<BillItem, 'id'>[];
  notes?: string;
  terms?: string;
  tax_amount?: number;
  discount_amount?: number;
}

export interface UpdateBillInput {
  bill_number?: string;
  party_id?: string;
  party_name?: string;
  date?: string;
  due_date?: string;
  items?: BillItem[];
  status?: Bill['status'];
  paid_amount?: number;
  notes?: string;
  terms?: string;
  tax_amount?: number;
  discount_amount?: number;
}

export interface FetchBillsOptions {
  partyId?: string;
  partyType?: 'customer' | 'supplier';
  status?: Bill['status'];
  limit?: number;
  offset?: number;
}

// ============================================================================
// BILLS SERVICE
// ============================================================================

class BillsService {
  private tableName = 'bills' as const;

  /**
   * Generate unique bill number
   */
  private async generateBillNumber(): Promise<string> {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Calculate bill totals
   */
  private calculateTotals(
    items: Omit<BillItem, 'id'>[],
    taxAmount: number = 0,
    discountAmount: number = 0
  ) {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const discountedTotal = itemTotal * (1 - item.discount_percentage / 100);
      const taxedTotal = discountedTotal * (1 + item.tax_rate / 100);
      return sum + taxedTotal;
    }, 0);

    const totalAmount = subtotal + taxAmount - discountAmount;
    
    return {
      total_amount: Math.round(totalAmount * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
    };
  }

  /**
   * Fetch bills with optional filtering and pagination
   */
  async fetchBills(options?: FetchBillsOptions): Promise<{
    data: Bill[] | null;
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

      // Apply filters
      if (options?.partyId) {
        query = query.eq('party_id', options.partyId);
      }
      if (options?.partyType) {
        query = query.eq('party_type', options.partyType);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      // Apply ordering
      query = query.order('date', { ascending: false });

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching bills:', error);
        return { data: null, error, count: 0 };
      }

      console.log(`✅ Fetched ${data?.length || 0} bills`);
      return { data: data as Bill[], error: null, count: count || 0 };
    } catch (err) {
      console.error('❌ Exception in fetchBills:', err);
      return { data: null, error: err, count: 0 };
    }
  }

  /**
   * Fetch a single bill by ID
   */
  async fetchBillById(id: string): Promise<{
    data: Bill | null;
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
        console.error('❌ Error fetching bill:', error);
        return { data: null, error };
      }

      return { data: data as Bill, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchBillById:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Create a new bill with real-time sync
   */
  async createBill(input: CreateBillInput): Promise<{
    data: Bill | null;
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

      // Generate bill number if not provided
      const billNumber = input.bill_number || await this.generateBillNumber();

      // Add IDs to items
      const itemsWithIds = input.items.map(item => ({
        ...item,
        id: generateUUID(),
      }));

      // Calculate totals
      const { total_amount } = this.calculateTotals(
        input.items,
        input.tax_amount,
        input.discount_amount
      );

      const billData = {
        user_id: user.id,
        bill_number: billNumber,
        party_id: input.party_id,
        party_type: input.party_type,
        party_name: input.party_name,
        date: input.date,
        due_date: input.due_date || null,
        total_amount,
        paid_amount: 0,
        balance_amount: total_amount,
        status: 'pending' as const,
        items: itemsWithIds,
        notes: input.notes || null,
        terms: input.terms || null,
        tax_amount: input.tax_amount || 0,
        discount_amount: input.discount_amount || 0,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating bill with real-time sync:', billData);

      const result = await realtimeSyncService.create<Bill>(
        this.tableName,
        billData as any
      );

      if (result.error) {
        console.error('❌ Error creating bill:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Bill created successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createBill:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update an existing bill with real-time sync
   */
  async updateBill(id: string, input: UpdateBillInput): Promise<{
    data: Bill | null;
    error: any;
  }> {
    try {
      // Fetch current bill
      const { data: currentBill, error: fetchError } = await this.fetchBillById(id);
      
      if (fetchError || !currentBill) {
        return { data: null, error: fetchError || new Error('Bill not found') };
      }

      // Recalculate totals if items changed
      let updateData: any = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      if (input.items) {
        const { total_amount } = this.calculateTotals(
          input.items,
          input.tax_amount ?? currentBill.tax_amount,
          input.discount_amount ?? currentBill.discount_amount
        );
        updateData.total_amount = total_amount;
        updateData.balance_amount = total_amount - (input.paid_amount ?? currentBill.paid_amount);
      }

      // Update status if paid in full
      if (input.paid_amount && input.paid_amount >= currentBill.total_amount) {
        updateData.status = 'paid';
        updateData.balance_amount = 0;
      }

      console.log('🔄 Updating bill with real-time sync:', id, updateData);

      const result = await realtimeSyncService.update<Bill>(
        this.tableName,
        id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating bill:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Bill updated successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateBill:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete a bill (soft delete) with real-time sync
   */
  async deleteBill(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      console.log('🗑️ Deleting bill with real-time sync:', id);

      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        console.error('❌ Error deleting bill:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Bill deleted successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in deleteBill:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Mark bill as paid
   */
  async markAsPaid(id: string, paidAmount: number): Promise<{
    data: Bill | null;
    error: any;
  }> {
    return this.updateBill(id, {
      paid_amount: paidAmount,
      status: 'paid',
    });
  }

  /**
   * Cancel a bill
   */
  async cancelBill(id: string): Promise<{
    data: Bill | null;
    error: any;
  }> {
    return this.updateBill(id, {
      status: 'cancelled',
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const billsService = new BillsService();
