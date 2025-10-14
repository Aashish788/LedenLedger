/**
 * Number to Words Converter
 * Indian Numbering System with support for Lakhs and Crores
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

/**
 * Convert number (0-99) to words
 */
function convertTwoDigits(num: number): string {
  if (num < 20) {
    return ones[num];
  }
  const tensDigit = Math.floor(num / 10);
  const onesDigit = num % 10;
  return tens[tensDigit] + (onesDigit > 0 ? ' ' + ones[onesDigit] : '');
}

/**
 * Convert number (0-999) to words
 */
function convertThreeDigits(num: number): string {
  if (num === 0) return '';
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  
  let result = '';
  
  if (hundreds > 0) {
    result = ones[hundreds] + ' Hundred';
  }
  
  if (remainder > 0) {
    if (result !== '') {
      result += ' ';
    }
    result += convertTwoDigits(remainder);
  }
  
  return result;
}

/**
 * Convert integer part to words (Indian numbering system)
 * Supports: Ones, Tens, Hundreds, Thousands, Lakhs, Crores
 */
function convertIntegerToWords(num: number): string {
  if (num === 0) {
    return 'Zero';
  }
  
  let result = '';
  
  // Crores (10,000,000)
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    result += convertThreeDigits(crores) + ' Crore';
    num %= 10000000;
  }
  
  // Lakhs (100,000)
  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    if (result !== '') result += ' ';
    result += convertThreeDigits(lakhs) + ' Lakh';
    num %= 100000;
  }
  
  // Thousands (1,000)
  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    if (result !== '') result += ' ';
    result += convertThreeDigits(thousands) + ' Thousand';
    num %= 1000;
  }
  
  // Hundreds, Tens, and Ones
  if (num > 0) {
    if (result !== '') result += ' ';
    result += convertThreeDigits(num);
  }
  
  return result.trim();
}

/**
 * Convert decimal part to words
 */
function convertDecimalToWords(decimalStr: string): string {
  // Take first two decimal places
  const decimal = decimalStr.substring(0, 2).padEnd(2, '0');
  const num = parseInt(decimal, 10);
  
  if (num === 0) return '';
  
  return convertTwoDigits(num);
}

/**
 * Main function: Convert amount to words
 * @param amount - The numeric amount to convert
 * @param currencyName - Currency name (e.g., 'Rupees', 'Dollars')
 * @param decimalName - Decimal currency name (e.g., 'Paise', 'Cents')
 * @returns The amount in words
 */
export function convertToWords(
  amount: number | string,
  currencyName: string = 'Rupees',
  decimalName: string = 'Paise'
): string {
  try {
    // Convert to string and handle edge cases
    const amountStr = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const numAmount = parseFloat(amountStr);
    
    if (isNaN(numAmount)) {
      return 'Invalid Amount';
    }
    
    if (numAmount < 0) {
      return 'Negative ' + convertToWords(Math.abs(numAmount), currencyName, decimalName);
    }
    
    if (numAmount === 0) {
      return `Zero ${currencyName} Only`;
    }
    
    // Split into integer and decimal parts
    const parts = amountStr.split('.');
    const integerPart = parseInt(parts[0], 10);
    const decimalPart = parts[1] || '00';
    
    let result = '';
    
    // Convert integer part
    if (integerPart > 0) {
      result = convertIntegerToWords(integerPart) + ' ' + currencyName;
    }
    
    // Convert decimal part
    const decimalWords = convertDecimalToWords(decimalPart);
    if (decimalWords) {
      if (result !== '') {
        result += ' and ';
      }
      result += decimalWords + ' ' + decimalName;
    }
    
    result += ' Only';
    
    return result;
  } catch (error) {
    console.error('Error converting number to words:', error);
    return 'Error Converting Amount';
  }
}

/**
 * Format currency amount with proper separators (Indian format)
 * Example: 1234567.89 → 12,34,567.89
 */
export function formatIndianCurrency(amount: number): string {
  try {
    const amountStr = amount.toFixed(2);
    const [integerPart, decimalPart] = amountStr.split('.');
    
    // Indian numbering: last 3 digits, then groups of 2
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    let formatted = lastThree;
    
    if (remaining) {
      // Add comma-separated groups of 2 digits
      const groups = [];
      for (let i = remaining.length; i > 0; i -= 2) {
        groups.unshift(remaining.slice(Math.max(0, i - 2), i));
      }
      formatted = groups.join(',') + ',' + formatted;
    }
    
    return decimalPart ? formatted + '.' + decimalPart : formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return amount.toFixed(2);
  }
}

/**
 * Get currency name based on symbol
 */
export function getCurrencyName(symbol: string): { currency: string; decimal: string } {
  const currencyMap: Record<string, { currency: string; decimal: string }> = {
    '₹': { currency: 'Rupees', decimal: 'Paise' },
    '$': { currency: 'Dollars', decimal: 'Cents' },
    '£': { currency: 'Pounds', decimal: 'Pence' },
    '€': { currency: 'Euros', decimal: 'Cents' },
  };
  
  return currencyMap[symbol] || { currency: 'Rupees', decimal: 'Paise' };
}

/**
 * Examples and Test Cases
 */
export function testNumberToWords(): void {
  console.log('=== Number to Words Test Cases ===');
  
  const testCases = [
    0,
    1,
    15,
    45,
    100,
    123,
    1000,
    1234,
    12345,
    123456,
    1234567,
    12345678,
    45678.50,
    1234567.89,
  ];
  
  testCases.forEach(num => {
    console.log(`${num} → ${convertToWords(num)}`);
    console.log(`Formatted: ${formatIndianCurrency(num)}`);
    console.log('---');
  });
}

