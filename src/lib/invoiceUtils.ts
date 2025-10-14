// Invoice System - Utility Functions
// Comprehensive calculations, validations, and helper functions

import { InvoiceData, InvoiceItem, InvoiceCalculation, CurrencyContext } from "@/types/invoice";

/**
 * Calculate line item amount
 * Formula: (Quantity × Price) - (Discount%)
 */
export function calculateLineItemAmount(
  quantity: string,
  price: string,
  discount: string
): number {
  const qty = parseFloat(quantity) || 0;
  const prc = parseFloat(price) || 0;
  const disc = parseFloat(discount) || 0;
  
  const amount = qty * prc;
  const discountAmount = amount * (disc / 100);
  const finalAmount = amount - discountAmount;
  
  return Math.round(finalAmount * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate invoice totals with GST
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  gstRate: number,
  gstType: "none" | "igst" | "cgst_sgst",
  includeGST: boolean
): InvoiceCalculation {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  let gstAmount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (includeGST && gstRate > 0) {
    gstAmount = (subtotal * gstRate) / 100;

    if (gstType === "cgst_sgst") {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else if (gstType === "igst") {
      igst = gstAmount;
    }
  }

  const total = subtotal + gstAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    total: Math.round(total * 100) / 100,
    amountInWords: numberToWords(total)
  };
}

/**
 * Validate GSTIN format
 * Format: 22AAAAA0000A1Z5 (15 characters)
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin || gstin.trim() === "") return true; // Optional field
  
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.trim());
}

/**
 * Extract state code from GSTIN
 */
export function getStateCodeFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return "";
  return gstin.substring(0, 2);
}

/**
 * Determine GST type based on business and customer location
 */
export function determineGSTType(
  businessGSTIN: string,
  customerGSTIN: string,
  businessState: string,
  customerState: string
): "igst" | "cgst_sgst" | "none" {
  // If either party doesn't have GSTIN, no GST
  if (!businessGSTIN || !customerGSTIN) {
    return "none";
  }

  const businessStateCode = getStateCodeFromGSTIN(businessGSTIN);
  const customerStateCode = getStateCodeFromGSTIN(customerGSTIN);

  // If we have state codes from GSTIN, use them
  if (businessStateCode && customerStateCode) {
    return businessStateCode === customerStateCode ? "cgst_sgst" : "igst";
  }

  // Fallback to state comparison
  if (businessState && customerState) {
    return businessState.toLowerCase() === customerState.toLowerCase() 
      ? "cgst_sgst" 
      : "igst";
  }

  return "none";
}

/**
 * Validate HSN/SAC code
 * HSN: 4-8 digits for goods
 * SAC: 6 digits for services
 */
export function validateHSNSAC(code: string): boolean {
  if (!code || code.trim() === "") return true; // Optional
  
  const hsnRegex = /^[0-9]{4,8}$/;
  return hsnRegex.test(code.trim());
}

/**
 * Generate auto invoice number
 * Format: INV-YYYY-0001
 */
export function generateInvoiceNumber(
  prefix: string = "INV",
  lastNumber: number = 0,
  year?: number
): string {
  const currentYear = year || new Date().getFullYear();
  const nextNumber = (lastNumber + 1).toString().padStart(4, "0");
  return `${prefix}-${currentYear}-${nextNumber}`;
}

/**
 * Convert number to words (for amount in words)
 * Supports Indian numbering system
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];
  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " and " + convertLessThanThousand(n % 100) : "")
    );
  }

  function convertToWords(n: number): string {
    if (n === 0) return "Zero";

    let result = "";

    // Crores
    if (n >= 10000000) {
      result += convertLessThanThousand(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }

    // Lakhs
    if (n >= 100000) {
      result += convertLessThanThousand(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }

    // Thousands
    if (n >= 1000) {
      result += convertLessThanThousand(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }

    // Remaining
    if (n > 0) {
      result += convertLessThanThousand(n);
    }

    return result.trim();
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let words = convertToWords(integerPart);

  if (decimalPart > 0) {
    words += " and " + convertToWords(decimalPart) + " Paise";
  }

  return words + " Only";
}

/**
 * Currency formatting utility
 */
export function createCurrencyContext(code: string = "INR"): CurrencyContext {
  const currencyConfig: Record<string, { symbol: string; locale: string }> = {
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" },
    AUD: { symbol: "A$", locale: "en-AU" },
    CAD: { symbol: "C$", locale: "en-CA" },
    SGD: { symbol: "S$", locale: "en-SG" },
    AED: { symbol: "د.إ", locale: "ar-AE" },
  };

  const config = currencyConfig[code] || currencyConfig.INR;

  return {
    code,
    symbol: config.symbol,
    format: (amount: number, options = {}) => {
      const formatted = new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: code,
        minimumFractionDigits: options.minimumFractionDigits ?? 2,
        maximumFractionDigits: options.maximumFractionDigits ?? 2,
      }).format(amount);

      return formatted;
    }
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, format: "short" | "long" = "short"): string {
  const date = new Date(dateString);
  
  if (format === "long") {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  }
  
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

/**
 * Calculate due date based on payment terms
 */
export function calculateDueDate(invoiceDate: Date, paymentTermsDays: number): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);
  return dueDate;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === "") return true; // Optional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === "") return true; // Optional
  
  // Indian phone: 10 digits or +91 followed by 10 digits
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

/**
 * Sanitize string for PDF generation
 */
export function sanitizeString(str: string): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "").trim();
}

/**
 * Get invoice status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "#6B7280",
    sent: "#3B82F6",
    paid: "#10B981",
    overdue: "#EF4444",
    cancelled: "#9CA3AF"
  };
  return colors[status] || colors.draft;
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, status: string): boolean {
  if (status === "paid" || status === "cancelled") return false;
  
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return due < today;
}

/**
 * Format currency amount without symbol
 */
export function formatAmount(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}

/**
 * Validate invoice data before saving
 */
export function validateInvoiceData(data: Partial<InvoiceData>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.billNumber || data.billNumber.trim() === "") {
    errors.push("Invoice number is required");
  }

  if (!data.businessName || data.businessName.trim() === "") {
    errors.push("Business name is required");
  }

  if (!data.customerName || data.customerName.trim() === "") {
    errors.push("Customer name is required");
  }

  if (!data.items || data.items.length === 0) {
    errors.push("At least one item is required");
  }

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.name || item.name.trim() === "") {
        errors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.price || parseFloat(item.price) < 0) {
        errors.push(`Item ${index + 1}: Price cannot be negative`);
      }
    });
  }

  if (data.businessGST && !validateGSTIN(data.businessGST)) {
    errors.push("Invalid business GSTIN format");
  }

  if (data.customerGST && !validateGSTIN(data.customerGST)) {
    errors.push("Invalid customer GSTIN format");
  }

  if (data.businessEmail && !validateEmail(data.businessEmail)) {
    errors.push("Invalid business email format");
  }

  if (data.customerEmail && !validateEmail(data.customerEmail)) {
    errors.push("Invalid customer email format");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate PDF filename
 */
export function generatePDFFilename(invoiceNumber: string, customerName: string): string {
  const sanitizedInvoice = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_");
  const sanitizedCustomer = customerName.replace(/[^a-zA-Z0-9-]/g, "_");
  const timestamp = new Date().getTime();
  
  return `Invoice_${sanitizedInvoice}_${sanitizedCustomer}_${timestamp}.pdf`;
}

/**
 * Indian states list for dropdown
 */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

/**
 * GST rates dropdown options
 */
export const GST_RATES = [
  { value: 0, label: "0% (Exempted)" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" }
];

/**
 * Payment terms options
 */
export const PAYMENT_TERMS = [
  { value: 0, label: "Due on Receipt" },
  { value: 7, label: "Net 7 days" },
  { value: 15, label: "Net 15 days" },
  { value: 30, label: "Net 30 days" },
  { value: 45, label: "Net 45 days" },
  { value: 60, label: "Net 60 days" },
  { value: 90, label: "Net 90 days" }
];

/**
 * Default terms and conditions
 */
export const DEFAULT_TERMS_CONDITIONS = `1. Payment is due within the specified period from the date of invoice.
2. Interest at the rate of 18% per annum will be charged on overdue amounts.
3. All disputes are subject to local jurisdiction only.
4. Goods once sold will not be taken back.
5. E. & O.E. (Errors and Omissions Excepted).`;

/**
 * Default payment instructions
 */
export const DEFAULT_PAYMENT_INSTRUCTIONS = `Please make payment via bank transfer, UPI, or cash.
For bank transfers, please use the bank details mentioned above.
Quote invoice number as reference.`;

