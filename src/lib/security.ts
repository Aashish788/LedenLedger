/**
 * Security utilities for input validation, sanitization, and protection
 */

import { z } from 'zod';
import DOMPurify from 'dompurify';

// Input validation schemas
export const CustomerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\.-]+$/, 'Name contains invalid characters'),
  phone: z.string()
    .regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(15, 'Phone number too long'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  openingBalance: z.string()
    .regex(/^\d*\.?\d+$/, 'Invalid amount format')
    .optional()
    .or(z.literal('0')),
  balanceType: z.enum(['credit', 'debit'])
});

export const TransactionSchema = z.object({
  amount: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine((val) => parseFloat(val) <= 10000000, 'Amount exceeds maximum limit'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  type: z.enum(['gave', 'got'])
});

export const InvoiceSchema = z.object({
  customerName: z.string()
    .min(2, 'Customer name is required')
    .max(100, 'Customer name too long'),
  invoiceNumber: z.string()
    .min(1, 'Invoice number is required')
    .max(50, 'Invoice number too long')
    .regex(/^[A-Z0-9\-_]+$/i, 'Invalid invoice number format'),
  invoiceDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .optional()
    .or(z.literal('')),
  taxRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid tax rate')
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 100, 'Tax rate must be between 0-100'),
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .or(z.literal(''))
});

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
};

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// File validation
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const maxNameLength = 255;

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and GIF files are allowed' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  if (file.name.length > maxNameLength) {
    return { isValid: false, error: 'Filename too long' };
  }

  // Check for suspicious file extensions in name
  const suspiciousExtensions = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i;
  if (suspiciousExtensions.test(file.name)) {
    return { isValid: false, error: 'File type not allowed' };
  }

  return { isValid: true };
};

// Rate limiting helpers (client-side basic implementation)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
};

// Session security
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Secure storage helpers
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      // In production, implement encryption here
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  getItem: (key: string): any => {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      // In production, implement decryption here
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },

  clear: (): void => {
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
};

// Environment validation
export const validateEnvironment = (): boolean => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY'
  ];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  return true;
};

// Data integrity checks
export const validateDataIntegrity = (data: any, expectedFields: string[]): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  return expectedFields.every(field => field in data);
};

export default {
  CustomerSchema,
  TransactionSchema,
  InvoiceSchema,
  sanitizeInput,
  sanitizeHtml,
  validateFile,
  checkRateLimit,
  generateCSRFToken,
  secureStorage,
  validateEnvironment,
  validateDataIntegrity
};
