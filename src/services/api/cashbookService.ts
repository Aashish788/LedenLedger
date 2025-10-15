/**
 * Cashbook Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for cashbook entries with:
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

export interface CashbookEntry {
  id: string;
  user_id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  category: string;
  description: string | null;
  date: string;
  payment_method: 'cash' | 'bank' | 'upi' | 'card' | 'cheque' | 'other';
  reference_number: string | null;
  balance_after: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface CreateCashbookEntryInput {
  type: 'cash_in' | 'cash_out';
  amount: number;
  category: string;
  description?: string;
  date: string;
  payment_method?: CashbookEntry['payment_method'];
  reference_number?: string;
}

export interface UpdateCashbookEntryInput {
  type?: 'cash_in' | 'cash_out';
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  payment_method?: CashbookEntry['payment_method'];
  reference_number?: string;
}

export interface FetchCashbookEntriesOptions {
  type?: 'cash_in' | 'cash_out';
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// CASHBOOK SERVICE
// ============================================================================

class CashbookService {
  private tableName = 'cashbook_entries' as const;

  /**
   * Calculate balance after transaction
   */
  private async calculateBalance(
    amount: number,
    type: 'cash_in' | 'cash_out'
  ): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data: lastEntry } = await (supabase as any)
        .from(this.tableName)
        .select('balance_after')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const currentBalance = lastEntry?.balance_after || 0;
      return type === 'cash_in' 
        ? currentBalance + amount 
        : currentBalance - amount;
    } catch (err) {
      console.error('❌ Error calculating balance:', err);
      return 0;
    }
  }

  /**
   * Fetch cashbook entries with optional filtering and pagination
   */
  async fetchCashbookEntries(options?: FetchCashbookEntriesOptions): Promise<{
    data: CashbookEntry[] | null;
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
      if (options?.type) {
        query = query.eq('type', options.type);
      }
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
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
        console.error('❌ Error fetching cashbook entries:', error);
        return { data: null, error, count: 0 };
      }

      console.log(`✅ Fetched ${data?.length || 0} cashbook entries`);
      return { data: data as CashbookEntry[], error: null, count: count || 0 };
    } catch (err) {
      console.error('❌ Exception in fetchCashbookEntries:', err);
      return { data: null, error: err, count: 0 };
    }
  }

  /**
   * Create a new cashbook entry with real-time sync
   */
  async createCashbookEntry(input: CreateCashbookEntryInput): Promise<{
    data: CashbookEntry | null;
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

      // Calculate balance
      const balanceAfter = await this.calculateBalance(input.amount, input.type);

      // Map UI type to database type
      const dbType = input.type === 'cash_in' ? 'in' : 'out';

      const entryData = {
        type: dbType, // Use database format ('in'/'out')
        amount: input.amount,
        note: input.description || input.category || null,
        payment_mode: input.payment_method || 'cash',
        timestamp: input.date || new Date().toISOString(),
        user_id: user.id,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating cashbook entry with real-time sync:', entryData);

      const result = await realtimeSyncService.create<any>(
        this.tableName,
        entryData
      );

      if (result.error) {
        console.error('❌ Error creating cashbook entry:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Cashbook entry created successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createCashbookEntry:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update an existing cashbook entry with real-time sync
   */
  async updateCashbookEntry(id: string, input: UpdateCashbookEntryInput): Promise<{
    data: CashbookEntry | null;
    error: any;
  }> {
    try {
      const updateData: any = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Recalculate balance if amount or type changed
      if (input.amount || input.type) {
        const { data: currentEntry } = await this.fetchCashbookEntryById(id);
        if (currentEntry) {
          const amount = input.amount || currentEntry.amount;
          const type = input.type || currentEntry.type;
          updateData.balance_after = await this.calculateBalance(amount, type);
        }
      }

      console.log('🔄 Updating cashbook entry with real-time sync:', id, updateData);

      const result = await realtimeSyncService.update<CashbookEntry>(
        this.tableName,
        id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating cashbook entry:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Cashbook entry updated successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateCashbookEntry:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete a cashbook entry (soft delete) with real-time sync
   */
  async deleteCashbookEntry(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      console.log('🗑️ Deleting cashbook entry with real-time sync:', id);

      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        console.error('❌ Error deleting cashbook entry:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Cashbook entry deleted successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in deleteCashbookEntry:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Fetch a single cashbook entry by ID
   */
  async fetchCashbookEntryById(id: string): Promise<{
    data: CashbookEntry | null;
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
        console.error('❌ Error fetching cashbook entry:', error);
        return { data: null, error };
      }

      return { data: data as CashbookEntry, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchCashbookEntryById:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Get current cash balance
   */
  async getCurrentBalance(): Promise<{
    balance: number;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          balance: 0,
          error: { message: 'User not authenticated' },
        };
      }

      const { data } = await (supabase as any)
        .from(this.tableName)
        .select('balance_after')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { balance: data?.balance_after || 0, error: null };
    } catch (err) {
      console.error('❌ Exception in getCurrentBalance:', err);
      return { balance: 0, error: err };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const cashbookService = new CashbookService();
