/**
 * Attendance Service with Real-Time Sync
 * 
 * Industry-standard CRUD operations for attendance tracking with:
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

export interface Attendance {
  id: string;
  user_id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';
  total_hours: number | null;
  overtime_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  synced_at: string;
}

export interface CreateAttendanceInput {
  staff_id: string;
  staff_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: Attendance['status'];
  notes?: string;
}

export interface UpdateAttendanceInput {
  check_in?: string;
  check_out?: string;
  status?: Attendance['status'];
  notes?: string;
}

export interface FetchAttendanceOptions {
  staffId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: Attendance['status'];
  limit?: number;
  offset?: number;
}

// ============================================================================
// ATTENDANCE SERVICE
// ============================================================================

class AttendanceService {
  private tableName = 'attendance' as const;

  /**
   * Calculate total hours worked
   */
  private calculateHours(checkIn: string | null, checkOut: string | null): {
    totalHours: number | null;
    overtimeHours: number | null;
  } {
    if (!checkIn || !checkOut) {
      return { totalHours: null, overtimeHours: null };
    }

    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
    const totalMilliseconds = checkOutTime - checkInTime;
    const totalHours = totalMilliseconds / (1000 * 60 * 60);

    const standardHours = 8;
    const overtimeHours = totalHours > standardHours ? totalHours - standardHours : 0;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
    };
  }

  /**
   * Fetch attendance records with optional filtering and pagination
   */
  async fetchAttendance(options?: FetchAttendanceOptions): Promise<{
    data: Attendance[] | null;
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
      if (options?.staffId) {
        query = query.eq('staff_id', options.staffId);
      }
      if (options?.date) {
        query = query.eq('date', options.date);
      }
      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options?.endDate) {
        query = query.lte('date', options.endDate);
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
        console.error('❌ Error fetching attendance:', error);
        return { data: null, error, count: 0 };
      }

      console.log(`✅ Fetched ${data?.length || 0} attendance records`);
      return { data: data as Attendance[], error: null, count: count || 0 };
    } catch (err) {
      console.error('❌ Exception in fetchAttendance:', err);
      return { data: null, error: err, count: 0 };
    }
  }

  /**
   * Create attendance record with real-time sync
   */
  async createAttendance(input: CreateAttendanceInput): Promise<{
    data: Attendance | null;
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

      // Calculate hours
      const { totalHours, overtimeHours } = this.calculateHours(
        input.check_in || null,
        input.check_out || null
      );

      const attendanceData = {
        ...input,
        user_id: user.id,
        check_in: input.check_in || null,
        check_out: input.check_out || null,
        notes: input.notes || null,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        deleted_at: null,
        last_transaction: null,
        amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🚀 Creating attendance with real-time sync:', attendanceData);

      const result = await realtimeSyncService.create<Attendance>(
        this.tableName,
        attendanceData as any
      );

      if (result.error) {
        console.error('❌ Error creating attendance:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Attendance created successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in createAttendance:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Update attendance record with real-time sync
   */
  async updateAttendance(id: string, input: UpdateAttendanceInput): Promise<{
    data: Attendance | null;
    error: any;
  }> {
    try {
      // Get current attendance to calculate hours
      const { data: currentAttendance } = await this.fetchAttendanceById(id);
      
      if (!currentAttendance) {
        return { data: null, error: new Error('Attendance not found') };
      }

      const checkIn = input.check_in || currentAttendance.check_in;
      const checkOut = input.check_out || currentAttendance.check_out;

      const { totalHours, overtimeHours } = this.calculateHours(checkIn, checkOut);

      const updateData: any = {
        ...input,
        total_hours: totalHours,
        overtime_hours: overtimeHours,
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      console.log('🔄 Updating attendance with real-time sync:', id, updateData);

      const result = await realtimeSyncService.update<Attendance>(
        this.tableName,
        id,
        updateData
      );

      if (result.error) {
        console.error('❌ Error updating attendance:', result.error);
        return { data: null, error: result.error };
      }

      console.log('✅ Attendance updated successfully:', result.data);
      return { data: result.data, error: null };
    } catch (err) {
      console.error('❌ Exception in updateAttendance:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Delete attendance record (soft delete) with real-time sync
   */
  async deleteAttendance(id: string): Promise<{
    success: boolean;
    error: any;
  }> {
    try {
      console.log('🗑️ Deleting attendance with real-time sync:', id);

      const result = await realtimeSyncService.delete(this.tableName, id);

      if (result.error) {
        console.error('❌ Error deleting attendance:', result.error);
        return { success: false, error: result.error };
      }

      console.log('✅ Attendance deleted successfully');
      return { success: true, error: null };
    } catch (err) {
      console.error('❌ Exception in deleteAttendance:', err);
      return { success: false, error: err };
    }
  }

  /**
   * Fetch a single attendance record by ID
   */
  async fetchAttendanceById(id: string): Promise<{
    data: Attendance | null;
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
        console.error('❌ Error fetching attendance:', error);
        return { data: null, error };
      }

      return { data: data as Attendance, error: null };
    } catch (err) {
      console.error('❌ Exception in fetchAttendanceById:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Mark check-in
   */
  async checkIn(staffId: string, staffName: string): Promise<{
    data: Attendance | null;
    error: any;
  }> {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    return this.createAttendance({
      staff_id: staffId,
      staff_name: staffName,
      date: today,
      check_in: now,
      status: 'present',
    });
  }

  /**
   * Mark check-out
   */
  async checkOut(attendanceId: string): Promise<{
    data: Attendance | null;
    error: any;
  }> {
    const now = new Date().toISOString();

    return this.updateAttendance(attendanceId, {
      check_out: now,
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const attendanceService = new AttendanceService();
