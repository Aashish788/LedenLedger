/**
 * Staff Management Data Service
 * Complete CRUD operations, attendance tracking, and salary calculations
 */

import {
  Staff,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  SalaryBreakdown,
  STORAGE_KEYS,
  STAFF_DEFAULTS,
  StaffFormData,
} from '@/types/staff';

/**
 * Staff Service Class
 * Handles all staff-related data operations
 */
class StaffService {
  
  // ============================================================================
  // STAFF CRUD OPERATIONS
  // ============================================================================
  
  /**
   * Get all staff members
   */
  async getStaff(): Promise<Staff[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting staff:', error);
      return [];
    }
  }

  /**
   * Get staff member by ID
   */
  async getStaffById(id: string): Promise<Staff | null> {
    try {
      const staffList = await this.getStaff();
      return staffList.find(staff => staff.id === id) || null;
    } catch (error) {
      console.error('Error getting staff by ID:', error);
      return null;
    }
  }

  /**
   * Add new staff member
   */
  async addStaff(staffData: Partial<StaffFormData>): Promise<Staff> {
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: staffData.name || '',
      phone: staffData.phone || '',
      email: staffData.email,
      position: staffData.position || '',
      monthlySalary: staffData.monthlySalary || 0,
      hireDate: staffData.hireDate || new Date().toISOString().split('T')[0],
      address: staffData.address,
      emergencyContact: staffData.emergencyContact,
      notes: staffData.notes,
      isActive: staffData.isActive !== false,
      basicPercent: staffData.basicPercent ?? STAFF_DEFAULTS.BASIC_PERCENT,
      hraPercent: staffData.hraPercent ?? STAFF_DEFAULTS.HRA_PERCENT,
      allowancesAmount: staffData.allowancesAmount ?? STAFF_DEFAULTS.ALLOWANCES_AMOUNT,
      includePF: staffData.includePF ?? false,
      pfPercent: staffData.pfPercent ?? STAFF_DEFAULTS.PF_PERCENT,
      includeESI: staffData.includeESI ?? false,
      esiPercent: staffData.esiPercent ?? STAFF_DEFAULTS.ESI_PERCENT,
      allowedLeaveDays: staffData.allowedLeaveDays ?? STAFF_DEFAULTS.ALLOWED_LEAVE_DAYS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const staffList = await this.getStaff();
    staffList.unshift(newStaff);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));

    return newStaff;
  }

  /**
   * Update staff member
   */
  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff | null> {
    try {
      const staffList = await this.getStaff();
      const index = staffList.findIndex(staff => staff.id === id);

      if (index === -1) {
        throw new Error('Staff member not found');
      }

      const updatedStaff: Staff = {
        ...staffList[index],
        ...updates,
        id, // Preserve ID
        updatedAt: new Date().toISOString(),
      };

      staffList[index] = updatedStaff;
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));

      return updatedStaff;
    } catch (error) {
      console.error('Error updating staff:', error);
      return null;
    }
  }

  /**
   * Delete staff member and associated attendance records
   */
  async deleteStaff(id: string): Promise<boolean> {
    try {
      const staffList = await this.getStaff();
      const filteredStaff = staffList.filter(staff => staff.id !== id);
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filteredStaff));

      // Delete associated attendance records
      await this.deleteStaffAttendance(id);

      return true;
    } catch (error) {
      console.error('Error deleting staff:', error);
      return false;
    }
  }

  /**
   * Toggle staff active status
   */
  async toggleStaffStatus(id: string): Promise<boolean> {
    try {
      const staff = await this.getStaffById(id);
      if (!staff) return false;

      await this.updateStaff(id, { isActive: !staff.isActive });
      return true;
    } catch (error) {
      console.error('Error toggling staff status:', error);
      return false;
    }
  }

  // ============================================================================
  // ATTENDANCE OPERATIONS
  // ============================================================================

  /**
   * Get all attendance records for a staff member
   */
  async getStaffAttendance(staffId: string): Promise<AttendanceRecord[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE);
      const allAttendance: Record<string, AttendanceRecord[]> = data ? JSON.parse(data) : {};
      return allAttendance[staffId] || [];
    } catch (error) {
      console.error('Error getting staff attendance:', error);
      return [];
    }
  }

  /**
   * Get attendance record for a specific date
   */
  async getAttendanceForDate(staffId: string, date: string): Promise<AttendanceRecord | null> {
    try {
      const records = await this.getStaffAttendance(staffId);
      return records.find(record => record.date === date) || null;
    } catch (error) {
      console.error('Error getting attendance for date:', error);
      return null;
    }
  }

  /**
   * Mark attendance for a staff member
   */
  async markStaffAttendance(
    staffId: string,
    date: string,
    status: AttendanceStatus
  ): Promise<AttendanceRecord> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE);
      const allAttendance: Record<string, AttendanceRecord[]> = data ? JSON.parse(data) : {};
      
      if (!allAttendance[staffId]) {
        allAttendance[staffId] = [];
      }

      const existingIndex = allAttendance[staffId].findIndex(
        record => record.date === date
      );

      const attendanceRecord: AttendanceRecord = {
        id: `${staffId}_${date}`,
        staffId,
        date,
        status,
        createdAt: existingIndex === -1 ? new Date().toISOString() : allAttendance[staffId][existingIndex].createdAt,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        allAttendance[staffId][existingIndex] = attendanceRecord;
      } else {
        allAttendance[staffId].push(attendanceRecord);
      }

      // Sort by date (newest first)
      allAttendance[staffId].sort((a, b) => b.date.localeCompare(a.date));

      localStorage.setItem(STORAGE_KEYS.STAFF_ATTENDANCE, JSON.stringify(allAttendance));

      return attendanceRecord;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Unmark attendance for a specific date
   */
  async unmarkAttendance(staffId: string, date: string): Promise<boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE);
      const allAttendance: Record<string, AttendanceRecord[]> = data ? JSON.parse(data) : {};

      if (!allAttendance[staffId]) {
        return false;
      }

      allAttendance[staffId] = allAttendance[staffId].filter(
        record => record.date !== date
      );

      localStorage.setItem(STORAGE_KEYS.STAFF_ATTENDANCE, JSON.stringify(allAttendance));

      return true;
    } catch (error) {
      console.error('Error unmarking attendance:', error);
      return false;
    }
  }

  /**
   * Delete all attendance records for a staff member
   */
  async deleteStaffAttendance(staffId: string): Promise<boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF_ATTENDANCE);
      const allAttendance: Record<string, AttendanceRecord[]> = data ? JSON.parse(data) : {};

      delete allAttendance[staffId];

      localStorage.setItem(STORAGE_KEYS.STAFF_ATTENDANCE, JSON.stringify(allAttendance));

      return true;
    } catch (error) {
      console.error('Error deleting staff attendance:', error);
      return false;
    }
  }

  /**
   * Get attendance records for a date range
   */
  async getAttendanceForDateRange(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    try {
      const allRecords = await this.getStaffAttendance(staffId);
      
      return allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting attendance for date range:', error);
      return [];
    }
  }

  // ============================================================================
  // ATTENDANCE SUMMARY CALCULATIONS
  // ============================================================================

  /**
   * Calculate attendance summary for a given period
   */
  calculateAttendanceSummary(
    records: AttendanceRecord[],
    allowedLeaveDays: number = STAFF_DEFAULTS.ALLOWED_LEAVE_DAYS
  ): AttendanceSummary {
    const summary = {
      present: 0,
      half: 0,
      leave: 0,
      absent: 0,
    };

    records.forEach(record => {
      summary[record.status]++;
    });

    const freeLeaveDays = Math.min(summary.leave, allowedLeaveDays);
    const paidLeaveDays = freeLeaveDays;
    const unpaidLeaveDays = Math.max(0, summary.leave - allowedLeaveDays);
    const remainingLeaveDays = Math.max(0, allowedLeaveDays - summary.leave);
    const daysCompleted = records.length;

    // Attendance percentage calculation
    // Present days + Half days (0.5) + Paid Leaves
    const effectivePresentDays = summary.present + (summary.half * 0.5) + paidLeaveDays;
    const attendancePercentage = daysCompleted > 0
      ? (effectivePresentDays / daysCompleted) * 100
      : 0;

    return {
      ...summary,
      paidLeaveDays,
      unpaidLeaveDays,
      freeLeaveDays,
      remainingLeaveDays,
      daysCompleted,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      allowedLeaveDays,
    };
  }

  // ============================================================================
  // SALARY CALCULATION ENGINE
  // ============================================================================

  /**
   * Calculate complete salary breakdown
   */
  calculateSalary(
    staff: Staff,
    attendanceSummary: AttendanceSummary,
    year: number,
    month: number
  ): SalaryBreakdown {
    const {
      monthlySalary,
      basicPercent = STAFF_DEFAULTS.BASIC_PERCENT,
      hraPercent = STAFF_DEFAULTS.HRA_PERCENT,
      allowancesAmount = STAFF_DEFAULTS.ALLOWANCES_AMOUNT,
      includePF = false,
      pfPercent = STAFF_DEFAULTS.PF_PERCENT,
      includeESI = false,
      esiPercent = STAFF_DEFAULTS.ESI_PERCENT,
    } = staff;

    // Determine if simple mode (Basic = 100%, HRA = 0)
    const isSimpleMode = basicPercent === 100 && hraPercent === 0;

    // Calculate days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailySalary = monthlySalary / daysInMonth;

    // Salary Structure Breakdown
    const basicAmount = monthlySalary * (basicPercent / 100);
    const hraAmount = monthlySalary * (hraPercent / 100);
    const grossEarnings = basicAmount + hraAmount + allowancesAmount;

    // Attendance-based Earnings Calculation
    const { present, half, paidLeaveDays, unpaidLeaveDays } = attendanceSummary;
    
    const presentEarnings = present * dailySalary;
    const halfDayEarnings = half * (dailySalary / 2);
    const paidLeaveEarnings = paidLeaveDays * dailySalary;
    const totalEarned = presentEarnings + halfDayEarnings + paidLeaveEarnings;

    // Deductions Calculation
    const attendanceDeduction = monthlySalary - totalEarned;
    const pfAmount = includePF ? (totalEarned * (pfPercent / 100)) : 0;
    const esiAmount = includeESI ? (totalEarned * (esiPercent / 100)) : 0;
    const unpaidLeaveDeduction = unpaidLeaveDays * dailySalary;

    const totalDeductions = attendanceDeduction + pfAmount + esiAmount;

    // Net Salary
    const netSalary = grossEarnings - totalDeductions;

    return {
      basicAmount: Math.round(basicAmount * 100) / 100,
      hraAmount: Math.round(hraAmount * 100) / 100,
      allowancesAmount: Math.round(allowancesAmount * 100) / 100,
      grossEarnings: Math.round(grossEarnings * 100) / 100,
      presentEarnings: Math.round(presentEarnings * 100) / 100,
      halfDayEarnings: Math.round(halfDayEarnings * 100) / 100,
      paidLeaveEarnings: Math.round(paidLeaveEarnings * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,
      pfAmount: Math.round(pfAmount * 100) / 100,
      esiAmount: Math.round(esiAmount * 100) / 100,
      attendanceDeduction: Math.round(attendanceDeduction * 100) / 100,
      unpaidLeaveDeduction: Math.round(unpaidLeaveDeduction * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
      isSimpleMode,
      basicPercent,
      hraPercent,
      includePF,
      includeESI,
      pfPercent,
      esiPercent,
      daysInMonth,
      dailySalary: Math.round(dailySalary * 100) / 100,
    };
  }

  // ============================================================================
  // SEARCH AND FILTER OPERATIONS
  // ============================================================================

  /**
   * Search staff by name or position
   */
  async searchStaff(query: string): Promise<Staff[]> {
    try {
      const allStaff = await this.getStaff();
      const lowercaseQuery = query.toLowerCase().trim();

      if (!lowercaseQuery) {
        return allStaff;
      }

      return allStaff.filter(staff =>
        staff.name.toLowerCase().includes(lowercaseQuery) ||
        staff.position.toLowerCase().includes(lowercaseQuery) ||
        staff.phone.includes(lowercaseQuery) ||
        staff.email?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching staff:', error);
      return [];
    }
  }

  /**
   * Filter staff by active status
   */
  async filterStaffByStatus(status: 'all' | 'active' | 'inactive'): Promise<Staff[]> {
    try {
      const allStaff = await this.getStaff();

      if (status === 'all') {
        return allStaff;
      }

      return allStaff.filter(staff =>
        status === 'active' ? staff.isActive : !staff.isActive
      );
    } catch (error) {
      console.error('Error filtering staff:', error);
      return [];
    }
  }

  /**
   * Get staff statistics
   */
  async getStaffStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalMonthlyPayroll: number;
  }> {
    try {
      const allStaff = await this.getStaff();
      
      const active = allStaff.filter(staff => staff.isActive).length;
      const inactive = allStaff.length - active;
      const totalMonthlyPayroll = allStaff
        .filter(staff => staff.isActive)
        .reduce((sum, staff) => sum + staff.monthlySalary, 0);

      return {
        total: allStaff.length,
        active,
        inactive,
        totalMonthlyPayroll: Math.round(totalMonthlyPayroll * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting staff stats:', error);
      return { total: 0, active: 0, inactive: 0, totalMonthlyPayroll: 0 };
    }
  }
}

// Export singleton instance
export const staffService = new StaffService();

