/**
 * Payslip Generation System
 * Professional HTML template with PDF export capabilities
 */

import { Staff, SalaryBreakdown, AttendanceSummary, PayslipData } from '@/types/staff';
import { convertToWords, formatIndianCurrency, getCurrencyName } from './numberToWords';

/**
 * Generate employee ID from staff ID
 * Format: EMP-{last4digits}
 */
function generateEmployeeId(staffId: string): string {
  const last4 = staffId.slice(-4).padStart(4, '0');
  return `EMP-${last4}`;
}

/**
 * Format date to readable format
 * Example: 2024-01-15 → 15 Jan 2024
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format month-year
 * Example: 2024-01 → January 2024
 */
function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Build complete payslip data object
 */
export function buildPayslipData(
  staff: Staff,
  salaryBreakdown: SalaryBreakdown,
  attendanceSummary: AttendanceSummary,
  year: number,
  month: number,
  businessProfile: any, // From context
  currencySymbol: string = '₹'
): PayslipData {
  const { currency: currencyName, decimal: decimalName } = getCurrencyName(currencySymbol);
  
  return {
    // Company Information
    companyName: businessProfile?.businessName || 'Your Company Name',
    companyAddress: [
      businessProfile?.address,
      businessProfile?.city,
      businessProfile?.state,
      businessProfile?.pincode
    ].filter(Boolean).join(', ') || 'Company Address',
    companyPhone: businessProfile?.phone || '',
    companyEmail: businessProfile?.email || '',
    companyGST: businessProfile?.gstNumber || '',
    companyWebsite: businessProfile?.website || '',
    
    // Employee Information
    employeeId: generateEmployeeId(staff.id),
    employeeName: staff.name,
    employeePosition: staff.position,
    employeeDepartment: 'Operations',
    employeeJoiningDate: formatDate(staff.hireDate),
    employeePhone: staff.phone,
    employeeEmail: staff.email,
    
    // Period Information
    monthYear: formatMonthYear(year, month),
    generatedDate: formatDate(new Date().toISOString()),
    daysInMonth: salaryBreakdown.daysInMonth,
    
    // Attendance Summary
    attendanceSummary,
    
    // Salary Breakdown
    salaryBreakdown,
    
    // Amount in Words
    amountInWords: convertToWords(salaryBreakdown.netSalary, currencyName, decimalName),
  };
}

/**
 * Generate professional payslip HTML
 */
export function generatePayslipHTML(payslipData: PayslipData, currencySymbol: string = '₹'): string {
  const { salaryBreakdown: sb, attendanceSummary: as, ...data } = payslipData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payslip - ${data.employeeName} - ${data.monthYear}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1f2937;
      padding: 15px;
      background: #ffffff;
    }
    
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 20px 25px;
      text-align: center;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .company-info {
      font-size: 10px;
      opacity: 0.95;
      line-height: 1.4;
    }
    
    .payslip-title {
      background: #f3f4f6;
      padding: 12px 25px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .payslip-title h2 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 4px;
    }
    
    .period-info {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #6b7280;
      margin-top: 4px;
    }
    
    .content {
      padding: 20px 25px;
    }
    
    .employee-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1px dashed #d1d5db;
    }
    
    .info-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .info-row {
      display: flex;
      font-size: 10px;
    }
    
    .info-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 115px;
    }
    
    .info-value {
      color: #1f2937;
      font-weight: 500;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #1f2937;
      margin: 14px 0 8px 0;
      padding-bottom: 4px;
      border-bottom: 2px solid #3b82f6;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 10px;
    }
    
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.4px;
    }
    
    td {
      color: #1f2937;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    .earnings-section {
      background: #f0fdf4;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    
    .earnings-section th {
      background: #059669;
      color: white;
    }
    
    .deductions-section {
      background: #fef2f2;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    
    .deductions-section th {
      background: #dc2626;
      color: white;
    }
    
    .attendance-section {
      background: #eff6ff;
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    
    .attendance-section th {
      background: #2563eb;
      color: white;
    }
    
    .total-row {
      font-weight: bold;
      font-size: 11px;
      background: #f3f4f6;
    }
    
    .net-pay-section {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border: 2px solid #3b82f6;
      border-radius: 6px;
      padding: 14px 16px;
      margin: 16px 0 12px 0;
    }
    
    .net-pay-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .net-pay-label {
      font-size: 15px;
      font-weight: bold;
      color: #1e40af;
      text-transform: uppercase;
    }
    
    .net-pay-value {
      font-size: 22px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .amount-words {
      font-size: 10px;
      color: #1e40af;
      font-style: italic;
      padding-top: 8px;
      border-top: 1px dashed #3b82f6;
    }
    
    .amount-words-label {
      font-weight: 600;
      display: inline-block;
      margin-right: 4px;
    }
    
    .footer {
      background: #f9fafb;
      padding: 14px 25px;
      text-align: center;
      border-top: 2px solid #e5e7eb;
      font-size: 9px;
      color: #6b7280;
    }
    
    .footer-note {
      margin-bottom: 6px;
      font-style: italic;
    }
    
    .footer-company {
      font-weight: 600;
      color: #1f2937;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .payslip-container {
        border: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <!-- Header -->
    <div class="header">
      <div class="company-name">${data.companyName}</div>
      <div class="company-info">
        <div>${data.companyAddress}</div>
        ${data.companyPhone ? `<div>Phone: ${data.companyPhone}</div>` : ''}
        ${data.companyEmail ? `<div>Email: ${data.companyEmail}</div>` : ''}
        ${data.companyGST ? `<div>GST: ${data.companyGST}</div>` : ''}
      </div>
    </div>
    
    <!-- Payslip Title -->
    <div class="payslip-title">
      <h2>SALARY SLIP</h2>
      <div class="period-info">
        <span><strong>Pay Period:</strong> ${data.monthYear}</span>
        <span><strong>Generated On:</strong> ${data.generatedDate}</span>
      </div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Employee Details -->
      <div class="employee-section">
        <div class="info-group">
          <div class="info-row">
            <span class="info-label">Employee ID:</span>
            <span class="info-value">${data.employeeId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span class="info-value">${data.employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Designation:</span>
            <span class="info-value">${data.employeePosition}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Department:</span>
            <span class="info-value">${data.employeeDepartment}</span>
          </div>
        </div>
        <div class="info-group">
          <div class="info-row">
            <span class="info-label">Date of Joining:</span>
            <span class="info-value">${data.employeeJoiningDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Working Days:</span>
            <span class="info-value">${data.daysInMonth}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value">${data.employeePhone}</span>
          </div>
          ${data.employeeEmail ? `
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${data.employeeEmail}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Attendance Summary -->
      <div class="section-title">Attendance Summary</div>
      <table class="attendance-section">
        <thead>
          <tr>
            <th class="text-center">Present Days</th>
            <th class="text-center">Half Days</th>
            <th class="text-center">Paid Leaves</th>
            <th class="text-center">Unpaid Leaves</th>
            <th class="text-center">Absent Days</th>
            <th class="text-center">Days Completed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">${as.present}</td>
            <td class="text-center">${as.half}</td>
            <td class="text-center">${as.paidLeaveDays}</td>
            <td class="text-center">${as.unpaidLeaveDays}</td>
            <td class="text-center">${as.absent}</td>
            <td class="text-center">${as.daysCompleted}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Earnings -->
      <div class="section-title">Earnings</div>
      <table class="earnings-section">
        <thead>
          <tr>
            <th>Component</th>
            <th class="text-right">Amount (${currencySymbol})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary (${sb.basicPercent}%)</td>
            <td class="text-right">${formatIndianCurrency(sb.basicAmount)}</td>
          </tr>
          ${sb.hraAmount > 0 ? `
          <tr>
            <td>House Rent Allowance (${sb.hraPercent}%)</td>
            <td class="text-right">${formatIndianCurrency(sb.hraAmount)}</td>
          </tr>
          ` : ''}
          ${sb.allowancesAmount > 0 ? `
          <tr>
            <td>Other Allowances</td>
            <td class="text-right">${formatIndianCurrency(sb.allowancesAmount)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Gross Earnings</td>
            <td class="text-right">${currencySymbol} ${formatIndianCurrency(sb.grossEarnings)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Deductions -->
      <div class="section-title">Deductions</div>
      <table class="deductions-section">
        <thead>
          <tr>
            <th>Component</th>
            <th class="text-right">Amount (${currencySymbol})</th>
          </tr>
        </thead>
        <tbody>
          ${sb.attendanceDeduction > 0 ? `
          <tr>
            <td>Attendance Deduction</td>
            <td class="text-right">${formatIndianCurrency(sb.attendanceDeduction)}</td>
          </tr>
          ` : ''}
          ${sb.pfAmount > 0 ? `
          <tr>
            <td>Provident Fund (${sb.pfPercent}%)</td>
            <td class="text-right">${formatIndianCurrency(sb.pfAmount)}</td>
          </tr>
          ` : ''}
          ${sb.esiAmount > 0 ? `
          <tr>
            <td>ESI (${sb.esiPercent}%)</td>
            <td class="text-right">${formatIndianCurrency(sb.esiAmount)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total Deductions</td>
            <td class="text-right">${currencySymbol} ${formatIndianCurrency(sb.totalDeductions)}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Net Pay -->
      <div class="net-pay-section">
        <div class="net-pay-amount">
          <span class="net-pay-label">Net Pay (Take Home)</span>
          <span class="net-pay-value">${currencySymbol} ${formatIndianCurrency(sb.netSalary)}</span>
        </div>
        <div class="amount-words">
          <span class="amount-words-label">In Words:</span>
          <span>${data.amountInWords}</span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        This is a computer-generated payslip and does not require a signature.
      </div>
      <div class="footer-company">
        ${data.companyName}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Download payslip as HTML file (for web)
 */
export function downloadPayslipAsHTML(html: string, fileName: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print payslip (opens browser print dialog)
 */
export function printPayslip(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Generate payslip filename
 */
export function generatePayslipFilename(
  employeeName: string,
  monthYear: string,
  extension: string = 'pdf'
): string {
  const sanitizedName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
  const sanitizedMonth = monthYear.replace(/[^a-zA-Z0-9]/g, '_');
  return `Payslip_${sanitizedName}_${sanitizedMonth}.${extension}`;
}

