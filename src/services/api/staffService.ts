/**
 * Staff Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for staff management with:
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

export interface Staff {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  position: string;
  monthly_salary: number;
  hire_date: string;
  is_active: boolean;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
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

export interface CreateStaffInput {
  name: string;
  phone: string;
  email?: string;
  position: string;
  monthly_salary: number;
  hire_date: string;
  is_active?: boolean;
  address?: string;
  emergency_contact?: string;
  notes?: string;
  basic_percent?: number;
  hra_percent?: number;
  allowances_amount?: number;
  include_pf?: boolean;
  pf_percent?: number;
  include_esi?: boolean;
  esi_percent?: number;
  allowed_leave_days?: number;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  monthly_salary?: number;
  hire_date?: string;
  is_active?: boolean;
  address?: string;
  emergency_contact?: string;
  notes?: string;
  basic_percent?: number;
  hra_percent?: number;
  allowances_amount?: number;
  include_pf?: boolean;
  pf_percent?: number;
  include_esi?: boolean;
  esi_percent?: number;
  allowed_leave_days?: number;
}

export interface FetchStaffOptions {
  is_active?: boolean;
  position?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// STAFF SERVICE
// ============================================================================

class StaffService {
  private tableName = 'staff' as const;

  /**
   * Fetch staff members with optional filtering and pagination
   */
  async fetchStaff(options?: FetchStaffOptions): Promise<{
    data: Staff[] | null;
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
      if (options?.is_active !== undefined) {
        query = query.eq('is_active', options.is_active);
      }
      if (options?.position) {
        query = query.eq('position', options.position);
      }
      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,phone.ilike.%${options.search}%,email.ilike.%${options.search}%`
        );
      }

      // Apply ordering
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Error fetching staff:', error);
        return { data: null, error, count: 0 };
      }

      console.log(`✅ Fetched ${data?.length || 0} staff members`);
      return { data: data as Staff[], error: null, count: count || 0 };
    } catch (err) {
      console.error('❌ Exception in fetchStaff:', err);
      return { data: null, error: err, count: 0 };
    }
  }

  /**
   * Fetch a single staff member by ID
   */
  async fetchStaffById(id: string): Promise<{
    data: Staff | null;
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
        console.error('❌ Error fetching staff member:', error);
        return { data: null, error };
      }

      return { data: data as Staff, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchStaffById:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Create a new staff member with real-time sync
   */
  async createStaff(input: CreateStaffInput): Promise<{
    data: Staff | null;
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

      const staffData = {
        ...input,
        user_id: user.id,
        is_active: input.is_active !== undefined ? input.is_active : true,
        email: input.email || null,
        address: input.address || null,
        emergency_contact: input.emergency_contact || null,
        notes: input.notes || null,
        basic_percent: input.basic_percent || null,
        hra_percent: input.hra_percent || null,
        allowances_amount: input.allowances_amount || null,
        include_pf: input.include_pf !== undefined ? input.include_pf : false,
        pf_percent: input.pf_percent || null,
        include_esi: input.include_esi !== undefined ? input.include_esi : false,
        esi_percent: input.esi_percent || null,
        allowed_leave_days: input.allowed_leave_days || null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating staff member with real-time sync:', staffData);

      const result = await realtimeSyncService.create<Staff>(
        this.tableName,
        staffData as any
      );

      if (result.error) {
        console.error('❌ Error creating staff member:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Staff member created successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createStaff:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update an existing staff member with real-time sync
   */
  async updateStaff(id: string, input: UpdateStaffInput): Promise<{
    data: Staff | null;
    error: any;
  }> {
    try {
      const updateData = {
        ...input,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🔄 Updating staff member with real-time sync:', id, updateData);

      const result = await realtimeSyncService.update<Staff>(
        this.tableName,
        id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating staff member:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Staff member updated successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateStaff:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete a staff member (soft delete) with real-time sync
   */
  async deleteStaff(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      console.log('🗑️ Deleting staff member with real-time sync:', id);

      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        console.error('❌ Error deleting staff member:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Staff member deleted successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in deleteStaff:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Update staff active status
   */
  async updateStaffStatus(id: string, is_active: boolean): Promise<{
    data: Staff | null;
    error: any;
  }> {
    return this.updateStaff(id, { is_active });
  }

  /**
   * Get active staff count
   */
  async getActiveStaffCount(): Promise<{
    count: number;
    error: any;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          count: 0,
          error: { message: 'User not authenticated' },
        };
      }

      const { count, error } = await (supabase as any)
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('deleted_at', null);

      if (error) {
        console.error('❌ Error fetching active staff count:', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      console.error('❌ Exception in getActiveStaffCount:', err);
      return { count: 0, error: err };
    }
  }

  /**
   * Alias for createStaff (for compatibility with modal)
   */
  async addStaff(input: any): Promise<Staff> {
    const result = await this.createStaff(input);
    if (result.error || !result.data) {
      throw new Error(result.error?.message || 'Failed to create staff');
    }
    return result.data;
  }

  /**
   * Toggle staff active/inactive status
   */
  async toggleStaffStatus(staffId: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Fetch current status
      const { data: staff } = await (supabase as any)
        .from(this.tableName)
        .select('is_active')
        .eq('id', staffId)
        .single();

      if (!staff) {
        return { success: false, error: 'Staff not found' };
      }

      // Toggle status
      const newStatus = !staff.is_active;
      const result = await this.updateStaff(staffId, { is_active: newStatus } as any);

      return { success: !result.error };
    } catch (err) {
      console.error('❌ Exception in toggleStaffStatus:', err);
      return { success: false, error: err };
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const staffService = new StaffService();
