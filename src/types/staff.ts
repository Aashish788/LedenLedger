/**
 * Staff Management & Payslip System - Type Definitions
 * Complete TypeScript interfaces for employee lifecycle management
 */

/**
 * Staff/Employee Interface
 * Comprehensive employee information with salary structure and leave configuration
 */
export interface Staff {
  // Primary Information
  id: string;                    // Unique identifier (timestamp-based)
  name: string;                  // Full legal name
  phone: string;                 // Primary contact (with country code support)
  email?: string;                // Optional email
  position: string;              // Job title/designation
  monthlySalary: number;         // Base monthly salary (CTC)
  hireDate: string;              // Date of joining (YYYY-MM-DD)
  isActive: boolean;             // Employment status
  
  // Extended Information
  address?: string;              // Residential address
  emergencyContact?: string;     // Emergency contact number
  notes?: string;                // Additional notes/remarks
  
  // Salary Structure Configuration
  basicPercent?: number;         // % of salary as Basic (default: 100)
  hraPercent?: number;           // % of salary as HRA (default: 0)
  allowancesAmount?: number;     // Fixed allowances amount (default: 0)
  
  // Statutory Deductions
  includePF?: boolean;           // Enable Provident Fund deduction
  pfPercent?: number;            // PF percentage (default: 12%)
  includeESI?: boolean;          // Enable ESI deduction
  esiPercent?: number;           // ESI percentage (default: 0.75%)
  
  // Leave Management
  allowedLeaveDays?: number;     // Monthly allowed paid leaves (default: 2)
  
  // Timestamps
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

/**
 * Attendance Status Types
 * - present: Full day attendance (100% salary)
 * - absent: No attendance (0% salary, no leave deducted)
 * - half: Half day attendance (50% salary)
 * - leave: Paid/Unpaid leave (100% salary if within quota)
 */
export type AttendanceStatus = 'present' | 'absent' | 'half' | 'leave';

/**
 * Attendance Record Interface
 * Daily attendance tracking for each employee
 */
export interface AttendanceRecord {
  id: string;                    // Format: {staffId}_{date}
  staffId: string;               // Foreign key to Staff
  date: string;                  // Attendance date (YYYY-MM-DD)
  status: AttendanceStatus;      // Attendance status
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}

/**
 * Attendance Summary Interface
 * Calculated metrics for a given period
 */
export interface AttendanceSummary {
  present: number;               // Count of present days
  half: number;                  // Count of half days
  leave: number;                 // Count of leave days (total)
  absent: number;                // Count of absent days
  paidLeaveDays: number;         // Paid leaves (within quota)
  unpaidLeaveDays: number;       // Unpaid leaves (excess)
  freeLeaveDays: number;         // Same as paidLeaveDays
  remainingLeaveDays: number;    // Remaining allowed leaves
  daysCompleted: number;         // Total days marked
  attendancePercentage: number;  // Attendance percentage
  allowedLeaveDays: number;      // Monthly quota
}

/**
 * Salary Breakdown Interface
 * Complete salary calculation with earnings and deductions
 */
export interface SalaryBreakdown {
  // Earnings Components
  basicAmount: number;           // Basic salary amount
  hraAmount: number;             // HRA amount
  allowancesAmount: number;      // Other allowances
  grossEarnings: number;         // Total gross earnings
  
  // Attendance-based Earnings
  presentEarnings: number;       // Earnings from present days
  halfDayEarnings: number;       // Earnings from half days
  paidLeaveEarnings: number;     // Earnings from paid leaves
  totalEarned: number;           // Total attendance-based earnings
  
  // Deductions
  pfAmount: number;              // Provident Fund deduction
  esiAmount: number;             // ESI deduction
  attendanceDeduction: number;   // Deduction due to absence/half days
  unpaidLeaveDeduction: number;  // Deduction due to unpaid leaves
  totalDeductions: number;       // Total deductions
  
  // Net Pay
  netSalary: number;             // Final take-home salary
  
  // Configuration Info
  isSimpleMode: boolean;         // Whether using simple salary mode
  basicPercent: number;          // Basic salary percentage
  hraPercent: number;            // HRA percentage
  includePF: boolean;            // Whether PF is included
  includeESI: boolean;           // Whether ESI is included
  pfPercent: number;             // PF percentage
  esiPercent: number;            // ESI percentage
  
  // Period Info
  daysInMonth: number;           // Total days in the period
  dailySalary: number;           // Per-day salary amount
}

/**
 * Date Range Filter Options
 */
export type DateFilterOption = 
  | 'current'      // This month
  | 'last1'        // Last month
  | 'last2'        // Last 2 months
  | 'last3'        // Last 3 months
  | 'last6'        // Last 6 months
  | 'year'         // This year (12 months)
  | 'custom';      // Custom date range

/**
 * Date Filter Configuration
 */
export interface DateFilter {
  id: DateFilterOption;
  label: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Payslip Data Interface
 * Complete data structure for payslip generation
 */
export interface PayslipData {
  // Company Information
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyGST: string;
  companyWebsite?: string;
  
  // Employee Information
  employeeId: string;            // Format: EMP-{last4digits}
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  employeeJoiningDate: string;
  employeePhone: string;
  employeeEmail?: string;
  
  // Period Information
  monthYear: string;             // Format: January 2024
  generatedDate: string;         // Format: DD MMM YYYY
  daysInMonth: number;
  
  // Attendance Summary
  attendanceSummary: AttendanceSummary;
  
  // Salary Breakdown
  salaryBreakdown: SalaryBreakdown;
  
  // Amount in Words
  amountInWords: string;
}

/**
 * Staff Validation Errors
 */
export interface StaffValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  position?: string;
  monthlySalary?: string;
  basicPercent?: string;
  hraPercent?: string;
  pfPercent?: string;
  esiPercent?: string;
  allowedLeaveDays?: string;
}

/**
 * Staff Form Data (for Add/Edit operations)
 */
export interface StaffFormData {
  name: string;
  phone: string;
  email?: string;
  position: string;
  monthlySalary: number;
  hireDate: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  isActive: boolean;
  
  // Salary Configuration
  isSimpleMode: boolean;
  basicPercent: number;
  hraPercent: number;
  allowancesAmount: number;
  
  // Deductions
  includePF: boolean;
  pfPercent: number;
  includeESI: boolean;
  esiPercent: number;
  
  // Leave Configuration
  allowedLeaveDays: number;
}

/**
 * Storage Keys for LocalStorage
 */
export const STORAGE_KEYS = {
  STAFF: 'staff_members',
  STAFF_ATTENDANCE: 'staff_attendance',
} as const;

/**
 * Default Values
 */
export const STAFF_DEFAULTS = {
  BASIC_PERCENT: 100,
  HRA_PERCENT: 0,
  ALLOWANCES_AMOUNT: 0,
  PF_PERCENT: 12,
  ESI_PERCENT: 0.75,
  ALLOWED_LEAVE_DAYS: 2,
  DEPARTMENT: 'Operations',
} as const;

/**
 * Color Scheme for Attendance Status
 */
export const ATTENDANCE_COLORS = {
  present: '#10B981',      // Green
  absent: '#EF4444',       // Red
  half: '#F59E0B',         // Orange
  leave: '#6366F1',        // Indigo
  unmarked: '#E5E7EB',     // Gray
} as const;

