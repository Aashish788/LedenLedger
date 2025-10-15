/**
 * Transactions Service with Real-Time Sync
 * 
 * @version 2.0.0
 */

import { realtimeSyncService } from '@/services/realtime/realtimeSyncService';
import { supabase } from '@/integrations/supabase/client';
import { customersService } from './customersService';
import { suppliersService } from './suppliersService';

export interface Transaction {
  id: string;
  user_id: string;
  party_id: string;
  party_type: 'customer' | 'supplier';
  type: 'gave' | 'got';
  amount: number;
  date: string;
  description: string | null;
  payment_method: string | null;
  reference_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface CreateTransactionInput {
  party_id: string;
  party_type: 'customer' | 'supplier';
  type: 'gave' | 'got';
  amount: number;
  date: string;
  description?: string;
  payment_method?: string;
  reference_number?: string;
}

class TransactionsService {
  private tableName = 'transactions' as const;

  async fetchTransactions(options?: {
    partyId?: string;
    partyType?: 'customer' | 'supplier';
    limit?: number;
    offset?: number;
  }): Promise<{ data: Transaction[] | null; error: any; count: number }> {
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
        .order('date', { ascending: false });

      if (options?.partyId) {
        query = query.eq('party_id', options.partyId);
      }

      if (options?.partyType) {
        query = query.eq('party_type', options.partyType);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return { data: data as Transaction[], error: null, count: count || 0 };
    } catch (error: any) {
      console.error('❌ Error fetching transactions:', error);
      return { data: null, error, count: 0 };
    }
  }

  async createTransaction(input: CreateTransactionInput): Promise<{ data: Transaction | null; error: any }> {
    try {
      // Map party_id and party_type to customer_id or supplier_id
      const transactionData: any = {
        type: input.type,
        amount: input.amount,
        date: input.date,
        description: input.description || null,
        payment_method: input.payment_method || 'cash',
        synced_at: new Date().toISOString(),
        deleted_at: null,
      };

      // Set the correct ID field based on party type
      if (input.party_type === 'customer') {
        transactionData.customer_id = input.party_id;
        transactionData.supplier_id = null;
      } else if (input.party_type === 'supplier') {
        transactionData.supplier_id = input.party_id;
        transactionData.customer_id = null;
      }

      console.log('📝 Creating transaction with data:', transactionData);

      // Create transaction with real-time sync
      const result = await realtimeSyncService.create<Transaction>(
        this.tableName,
        transactionData
      );

      if (result.error) {
        console.error('❌ Error from realtimeSyncService:', result.error);
        throw result.error;
      }

      console.log('✅ Transaction created successfully:', result.data);

      // Update party balance
      if (input.party_type === 'customer' && result.data) {
        await customersService.updateCustomerBalance(
          input.party_id,
          input.amount,
          input.type
        );
      } else if (input.party_type === 'supplier' && result.data) {
        // For suppliers: 'gave' means you gave to supplier (increase their amount)
        // 'received' means you received from supplier (decrease their amount)
        const balanceType = input.type === 'gave' ? 'increase' : 'decrease';
        await suppliersService.updateSupplierBalance(
          input.party_id,
          input.amount,
          balanceType
        );
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('❌ Error creating transaction:', error);
      return { data: null, error };
    }
  }

  async updateTransaction(id: string, input: Partial<CreateTransactionInput>): Promise<{ data: Transaction | null; error: any }> {
    try {
      const result = await realtimeSyncService.update<Transaction>(
        this.tableName,
        id,
        {
          ...input,
          synced_at: new Date().toISOString(),
        } as any
      );

      if (result.error) {
        throw result.error;
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('❌ Error updating transaction:', error);
      return { data: null, error };
    }
  }

  async deleteTransaction(id: string): Promise<{ success: boolean; error: any }> {
    try {
      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        throw result.error;
      }

      return { success: result.success, error: null };
    } catch (error: any) {
      console.error('❌ Error deleting transaction:', error);
      return { success: false, error };
    }
  }
}

export const transactionsService = new TransactionsService();
export default transactionsService;
