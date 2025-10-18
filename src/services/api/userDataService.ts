/**
 * User Data Service - Production-Ready Implementation
 * 
 * This service implements industry-standard data fetching patterns with:
 * - Row Level Security (RLS) enforcement
 * - User-specific data isolation
 * - Type safety and error handling
 * - Performance optimization with parallel queries
 * - Comprehensive logging for debugging
 * 
 * @version 1.0.0
 * @author Senior Backend Developer
 */

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Business Settings Interface
 */
export interface BusinessSettings {
  id: string;
  user_id: string;
  owner_name: string | null;
  business_name: string;
  business_type: string;
  business_category: string | null;
  gst_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone_number: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  date_format: string;
  number_format: string;
  fiscal_year_start: string;
  auto_backup: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alerts: boolean;
  payment_reminders: boolean;
  data_retention: string;
  country: string;
  is_gst_registered: boolean;
  gst_registration_type: string;
  state_code: string | null;
  default_tax_preference: string;
  enable_auto_state_detection: boolean;
  compliance_level: string;
  created_at: string;
  updated_at: string;
}

/**
 * Customer Interface
 */
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
  transactions?: Transaction[]; // All transactions for this customer
}

/**
 * Supplier Interface
 */
export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  amount: number;
  last_transaction: string | null;
  due_date: string | null;
  email: string | null;
  address: string | null;
  business_type: string | null;
  gst_number: string | null;
  payment_terms: string | null;
  notes: string | null;
  remind_until_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
  transactions?: Transaction[]; // All transactions for this supplier
}

/**
 * Invoice/Bill Interface
 */
export interface Invoice {
  id: string;
  user_id: string;
  bill_number: string;
  template: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_gst: string | null;
  customer_address: string | null;
  bill_date: string;
  due_date: string;
  business_name: string;
  business_address: string;
  business_gst: string | null;
  business_phone: string;
  business_email: string | null;
  gst_type: string;
  include_gst: boolean;
  gst_rate: number | null;
  items: any; // JSONB
  subtotal: number;
  gst_amount: number;
  total: number;
  notes: string | null;
  terms_and_conditions: string | null;
  payment_instructions: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

/**
 * Cash Book Entry Interface
 */
export interface CashBookEntry {
  id: string;
  user_id: string;
  type: 'in' | 'out';
  amount: number;
  note: string | null;
  payment_mode: 'cash' | 'online' | null;
  timestamp: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

/**
 * Staff Member Interface
 */
export interface StaffMember {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  position: string;
  monthly_salary: number;
  hire_date: string;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
  is_active: boolean;
  basic_percent: number | null;
  hra_percent: number | null;
  allowances_amount: number | null;
  include_pf: boolean;
  pf_percent: number | null;
  include_esi: boolean;
  esi_percent: number | null;
  allowed_leave_days: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

/**
 * Transaction Interface
 */
export interface Transaction {
  id: string;
  user_id: string;
  customer_id: string | null;
  supplier_id: string | null;
  type: 'gave' | 'received';
  amount: number;
  date: string;
  description: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

/**
 * User Profile Interface
 */
export interface UserProfile {
  id: string;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Complete User Data Response
 */
export interface UserDataResponse {
  success: boolean;
  data: {
    profile: UserProfile | null;
    businessSettings: BusinessSettings | null;
    customers: Customer[];
    suppliers: Supplier[];
    invoices: Invoice[];
    cashBook: CashBookEntry[];
    staff: StaffMember[];
    transactions: Transaction[];
  };
  metadata: {
    fetchedAt: string;
    userId: string;
    counts: {
      customers: number;
      suppliers: number;
      invoices: number;
      cashBook: number;
      staff: number;
      transactions: number;
    };
  };
  error?: string;
}

/**
 * Service Response Interface
 */
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

// ============================================================================
// ============================================================================
// CORE SERVICE CLASS
// ============================================================================

/**
 * Timeout configuration
 */
const TIMEOUT_CONFIG = {
  default: 30000,      // 30 seconds
  critical: 15000,     // 15 seconds (auth, etc)
  background: 60000,   // 60 seconds (analytics, etc)
};

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wrap a promise with timeout protection
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_CONFIG.default
): Promise<T> {
  return Promise.race([
    promise,
    createTimeoutPromise(timeoutMs)
  ]);
}

/**
 * UserDataService Class
 * 
 * Handles all user data fetching operations with proper security and error handling
 */
class UserDataService {
  private static instance: UserDataService;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(key: string): boolean {
    const cached = this.requestCache.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(key: string): any | null {
    if (this.isCacheValid(key)) {
      console.log(`[UserDataService] 📦 Using cached data for ${key}`);
      return this.requestCache.get(key)!.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: any): void {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Validate user authentication
   * @private
   */
  private async validateUser(): Promise<string | null> {
    try {
      const { data: { session }, error } = await withTimeout(
        supabase.auth.getSession(),
        TIMEOUT_CONFIG.critical
      );
      
      if (error) {
        console.error('[UserDataService] Authentication error:', error);
        return null;
      }

      if (!session?.user?.id) {
        console.error('[UserDataService] No authenticated user found');
        return null;
      }

      return session.user.id;
    } catch (error) {
      console.error('[UserDataService] Failed to validate user:', error);
      return null;
    }
  }

  /**
   * Fetch user profile data
   * @param userId - The authenticated user's ID
   */
  private async fetchUserProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    try {
      const cacheKey = `profile_${userId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return { data: cached, error: null };

      const result: any = await withTimeout(
        (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        TIMEOUT_CONFIG.default
      );

      const { data, error } = result;

      if (error) {
        console.error('[UserDataService] Profile fetch error:', error);
        return { data: null, error: error.message };
      }

      if (data) {
        this.setCachedData(cacheKey, data);
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Profile fetch failed:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Fetch business settings
   * @param userId - The authenticated user's ID
   */
  private async fetchBusinessSettings(userId: string): Promise<ServiceResponse<BusinessSettings>> {
    try {
      const cacheKey = `business_${userId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return { data: cached, error: null };

      const result: any = await withTimeout(
        (supabase as any)
          .from('business_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        TIMEOUT_CONFIG.default
      );

      const { data, error } = result;

      if (error) {
        console.error('[UserDataService] Business settings fetch error:', error);
        return { data: null, error: error.message };
      }

      if (data) {
        this.setCachedData(cacheKey, data);
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Business settings fetch failed:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Fetch customers with their transactions
   * @param userId - The authenticated user's ID
   */
  private async fetchCustomers(userId: string): Promise<ServiceResponse<Customer[]>> {
    try {
      // Step 1: Fetch customers
      const { data: customersData, error: customersError, count } = await (supabase as any)
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error('[UserDataService] ❌ Customers fetch error:', customersError);
        return { data: null, error: customersError.message, count: 0 };
      }

      // Step 2: Fetch all transactions for this user
      const { data: transactionsData, error: transactionsError } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.warn('[UserDataService] ⚠️ Transactions fetch error:', transactionsError);
        // Continue without transactions
      }

      // Step 3: Merge transactions into customers
      const customersWithTransactions = (customersData || []).map(customer => {
        const customerTransactions = (transactionsData || []).filter(
          t => t.customer_id === customer.id
        );

        const normalizedTransactions = customerTransactions.map(transaction => ({
          ...transaction,
          type: transaction.type === 'received' ? 'got' : 'gave',
          amount: Number(transaction.amount) || 0,
        }));
        
        return {
          ...customer,
          transactions: normalizedTransactions,
        };
      });

      // Log detailed info
      if (customersWithTransactions.length > 0) {
        const firstCustomer = customersWithTransactions[0];
        console.log(`[UserDataService] 📊 First customer details:`, {
          id: firstCustomer.id,
          name: firstCustomer.name,
          phone: firstCustomer.phone,
          transactionCount: firstCustomer.transactions?.length || 0,
          transactionSample: firstCustomer.transactions?.[0] ? {
            id: firstCustomer.transactions[0].id,
            type: firstCustomer.transactions[0].type,
            amount: firstCustomer.transactions[0].amount,
          } : null
        });
      }

      return { 
        data: customersWithTransactions, 
        error: null, 
        count: count || 0 
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] ❌ Customers fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch suppliers with their transactions
   * @param userId - The authenticated user's ID
   */
  private async fetchSuppliers(userId: string): Promise<ServiceResponse<Supplier[]>> {
    try {
      // Step 1: Fetch suppliers
      const { data: suppliersData, error: suppliersError, count } = await (supabase as any)
        .from('suppliers')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (suppliersError) {
        console.error('[UserDataService] ❌ Suppliers fetch error:', suppliersError);
        return { data: null, error: suppliersError.message, count: 0 };
      }

      // Step 2: Fetch all transactions for this user
      const { data: transactionsData, error: transactionsError } = await (supabase as any)
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (transactionsError) {
        console.warn('[UserDataService] ⚠️ Transactions fetch error:', transactionsError);
        // Continue without transactions
      }

      // Step 3: Merge transactions into suppliers
      const suppliersWithTransactions = (suppliersData || []).map(supplier => {
        const supplierTransactions = (transactionsData || []).filter(
          t => t.supplier_id === supplier.id
        );
        
        return {
          ...supplier,
          transactions: supplierTransactions
        };
      });

      // Log detailed info
      if (suppliersWithTransactions.length > 0) {
        const firstSupplier = suppliersWithTransactions[0];
        console.log(`[UserDataService] 📊 First supplier details:`, {
          id: firstSupplier.id,
          name: firstSupplier.name,
          phone: firstSupplier.phone,
          transactionCount: firstSupplier.transactions?.length || 0,
          transactionSample: firstSupplier.transactions?.[0] ? {
            id: firstSupplier.transactions[0].id,
            type: firstSupplier.transactions[0].type,
            amount: firstSupplier.transactions[0].amount,
          } : null
        });
      }

      return { 
        data: suppliersWithTransactions, 
        error: null, 
        count: count || 0 
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] ❌ Suppliers fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch invoices/bills
   * @param userId - The authenticated user's ID
   */
  private async fetchInvoices(userId: string): Promise<ServiceResponse<Invoice[]>> {
    try {
      const { data, error, count } = await (supabase as any)
        .from('bills')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[UserDataService] Invoices fetch error:', error);
        return { data: null, error: error.message, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Invoices fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch cash book entries
   * @param userId - The authenticated user's ID
   */
  private async fetchCashBook(userId: string): Promise<ServiceResponse<CashBookEntry[]>> {
    try {
      const { data, error, count } = await (supabase as any)
        .from('cashbook_entries')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('[UserDataService] Cash book fetch error:', error);
        return { data: null, error: error.message, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Cash book fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch staff members
   * @param userId - The authenticated user's ID
   */
  private async fetchStaff(userId: string): Promise<ServiceResponse<StaffMember[]>> {
    try {
      const { data, error, count } = await (supabase as any)
        .from('staff')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[UserDataService] Staff fetch error:', error);
        return { data: null, error: error.message, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Staff fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch transactions
   * @param userId - The authenticated user's ID
   */
  private async fetchTransactions(userId: string): Promise<ServiceResponse<Transaction[]>> {
    try {
      const { data, error, count } = await (supabase as any)
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[UserDataService] Transactions fetch error:', error);
        return { data: null, error: error.message, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Transactions fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Fetch attendance records for a specific staff member
   * @param userId - The authenticated user's ID
   * @param staffId - The staff member's ID (optional)
   * @param startDate - Start date for filtering (optional)
   * @param endDate - End date for filtering (optional)
   */
  public async fetchAttendanceRecords(
    staffId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ServiceResponse<any[]>> {
    try {
      const userId = await this.validateUser();
      if (!userId) {
        return { data: null, error: 'Authentication required', count: 0 };
      }

      let query = (supabase as any)
        .from('attendance_records')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('date', { ascending: false });

      // Filter by staff member if provided
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      // Filter by date range if provided
      if (startDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        query = query.gte('date', startDateStr);
      }
      if (endDate) {
        const endDateStr = endDate.toISOString().split('T')[0];
        query = query.lte('date', endDateStr);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('[UserDataService] Attendance fetch error:', error);
        return { data: null, error: error.message, count: 0 };
      }

      return { data: data || [], error: null, count: count || 0 };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Attendance fetch failed:', message);
      return { data: null, error: message, count: 0 };
    }
  }

  /**
   * Mark attendance for a staff member
   * @param staffId - The staff member's ID
   * @param date - The date to mark attendance
   * @param status - The attendance status (present, absent, half, leave)
   */
  public async markAttendance(
    staffId: string,
    date: string,
    status: 'present' | 'absent' | 'half' | 'leave'
  ): Promise<ServiceResponse<any>> {
    try {
      const userId = await this.validateUser();
      if (!userId) {
        return { data: null, error: 'Authentication required' };
      }

      const attendanceId = `${staffId}_${date}`;
      
      // Check if attendance already exists
      const { data: existing } = await (supabase as any)
        .from('attendance_records')
        .select('id')
        .eq('id', attendanceId)
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing
        result = await (supabase as any)
          .from('attendance_records')
          .update({
            status,
            updated_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
          })
          .eq('id', attendanceId)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Insert new
        result = await (supabase as any)
          .from('attendance_records')
          .insert({
            id: attendanceId,
            user_id: userId,
            staff_id: staffId,
            date,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            synced_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('[UserDataService] Mark attendance error:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[UserDataService] Mark attendance failed:', message);
      return { data: null, error: message };
    }
  }

  /**
   * Fetch all user data
   * 
   * This is the main method that fetches all user-related data in parallel
   * for optimal performance while maintaining data isolation through RLS.
   * 
   * @returns {Promise<UserDataResponse>} Complete user data with metadata
   * 
   * @example
   * ```typescript
   * const userDataService = UserDataService.getInstance();
   * const response = await userDataService.fetchAllUserData();
   * 
   * if (response.success) {
   *   console.log('User data:', response.data);
   *   console.log('Counts:', response.metadata.counts);
   * } else {
   *   console.error('Error:', response.error);
   * }
   * ```
   */
  public async fetchAllUserData(): Promise<UserDataResponse> {
    const startTime = Date.now();
    console.log('[UserDataService] Starting comprehensive data fetch...');

    try {
      // Step 1: Validate authentication
      const userId = await this.validateUser();
      
      if (!userId) {
        return {
          success: false,
          data: {
            profile: null,
            businessSettings: null,
            customers: [],
            suppliers: [],
            invoices: [],
            cashBook: [],
            staff: [],
            transactions: [],
          },
          metadata: {
            fetchedAt: new Date().toISOString(),
            userId: '',
            counts: {
              customers: 0,
              suppliers: 0,
              invoices: 0,
              cashBook: 0,
              staff: 0,
              transactions: 0,
            },
          },
          error: 'Authentication required. Please log in.',
        };
      }

      // Step 2: Fetch all data in parallel for optimal performance
      // All queries automatically use RLS policies to ensure data isolation
      const [
        profileResult,
        businessSettingsResult,
        customersResult,
        suppliersResult,
        invoicesResult,
        cashBookResult,
        staffResult,
        transactionsResult,
      ] = await Promise.all([
        this.fetchUserProfile(userId),
        this.fetchBusinessSettings(userId),
        this.fetchCustomers(userId),
        this.fetchSuppliers(userId),
        this.fetchInvoices(userId),
        this.fetchCashBook(userId),
        this.fetchStaff(userId),
        this.fetchTransactions(userId),
      ]);

      // Step 3: Collect any errors
      const errors: string[] = [];
      if (profileResult.error) errors.push(`Profile: ${profileResult.error}`);
      if (businessSettingsResult.error) errors.push(`Business: ${businessSettingsResult.error}`);
      if (customersResult.error) errors.push(`Customers: ${customersResult.error}`);
      if (suppliersResult.error) errors.push(`Suppliers: ${suppliersResult.error}`);
      if (invoicesResult.error) errors.push(`Invoices: ${invoicesResult.error}`);
      if (cashBookResult.error) errors.push(`CashBook: ${cashBookResult.error}`);
      if (staffResult.error) errors.push(`Staff: ${staffResult.error}`);
      if (transactionsResult.error) errors.push(`Transactions: ${transactionsResult.error}`);

      // Step 4: Build response
      const response: UserDataResponse = {
        success: errors.length === 0,
        data: {
          profile: profileResult.data,
          businessSettings: businessSettingsResult.data,
          customers: customersResult.data || [],
          suppliers: suppliersResult.data || [],
          invoices: invoicesResult.data || [],
          cashBook: cashBookResult.data || [],
          staff: staffResult.data || [],
          transactions: transactionsResult.data || [],
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          userId,
          counts: {
            customers: customersResult.count || 0,
            suppliers: suppliersResult.count || 0,
            invoices: invoicesResult.count || 0,
            cashBook: cashBookResult.count || 0,
            staff: staffResult.count || 0,
            transactions: transactionsResult.count || 0,
          },
        },
        error: errors.length > 0 ? errors.join('; ') : undefined,
      };

      if (errors.length > 0) {
        console.warn('[UserDataService] ⚠️ Errors encountered:', errors);
      }

      return response;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[UserDataService] Critical error during data fetch:', message);
      
      return {
        success: false,
        data: {
          profile: null,
          businessSettings: null,
          customers: [],
          suppliers: [],
          invoices: [],
          cashBook: [],
          staff: [],
          transactions: [],
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          userId: '',
          counts: {
            customers: 0,
            suppliers: 0,
            invoices: 0,
            cashBook: 0,
            staff: 0,
            transactions: 0,
          },
        },
        error: message,
      };
    }
  }

  /**
   * Fetch specific data type
   * @param dataType - Type of data to fetch
   */
  public async fetchSpecificData(
    dataType: 'profile' | 'business' | 'customers' | 'suppliers' | 'invoices' | 'cashBook' | 'staff' | 'transactions'
  ): Promise<ServiceResponse<any>> {
    const userId = await this.validateUser();
    
    if (!userId) {
      return { data: null, error: 'Authentication required' };
    }

    switch (dataType) {
      case 'profile':
        return this.fetchUserProfile(userId);
      case 'business':
        return this.fetchBusinessSettings(userId);
      case 'customers':
        return this.fetchCustomers(userId);
      case 'suppliers':
        return this.fetchSuppliers(userId);
      case 'invoices':
        return this.fetchInvoices(userId);
      case 'cashBook':
        return this.fetchCashBook(userId);
      case 'staff':
        return this.fetchStaff(userId);
      case 'transactions':
        return this.fetchTransactions(userId);
      default:
        return { data: null, error: 'Invalid data type' };
    }
  }

  /**
   * Refresh user data - useful for pull-to-refresh functionality
   */
  public async refreshUserData(): Promise<UserDataResponse> {
    console.log('[UserDataService] 🔄 Force Refreshing user data...');
    return this.fetchAllUserData();
  }

  /**
   * Debug method - Check customer data directly
   */
  public async debugCustomers(): Promise<void> {
    console.log('[UserDataService] 🔍 DEBUG MODE: Checking customers...');
    
    const userId = await this.validateUser();
    if (!userId) {
      console.error('[UserDataService] ❌ No user logged in!');
      return;
    }

    console.log('[UserDataService] ✅ User ID:', userId);

    try {
      const result = await this.fetchCustomers(userId);
      console.log('[UserDataService] 📊 Customer fetch result:', {
        success: result.error === null,
        count: result.count,
        customerCount: result.data?.length || 0,
        error: result.error,
        firstCustomer: result.data?.[0] ? {
          id: result.data[0].id,
          name: result.data[0].name,
          phone: result.data[0].phone,
          transactionCount: result.data[0].transactions?.length || 0,
        } : null
      });

      if (result.data && result.data.length > 0) {
        console.log('[UserDataService] ✅ CUSTOMERS FOUND:', result.data.length);
        result.data.forEach((customer, index) => {
          console.log(`[UserDataService] Customer ${index + 1}:`, {
            name: customer.name,
            phone: customer.phone,
            amount: customer.amount,
            transactions: customer.transactions?.length || 0
          });
        });
      } else {
        console.warn('[UserDataService] ⚠️ NO CUSTOMERS FOUND');
      }
    } catch (error) {
      console.error('[UserDataService] ❌ Debug failed:', error);
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const userDataService = UserDataService.getInstance();

// Export class for advanced usage
export { UserDataService };
