/**
 * Currency Context
 * Provides currency formatting and conversion throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'GBP' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
  },
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  format: (amount: number, options?: Intl.NumberFormatOptions) => string;
  getSymbol: () => string;
  getCurrencyName: () => string;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_currency';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('INR');

  // Load currency preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in CURRENCIES) {
        setCurrencyCode(stored as CurrencyCode);
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    }
  }, []);

  const currency = CURRENCIES[currencyCode];

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  };

  const format = (amount: number, options?: Intl.NumberFormatOptions): string => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    };

    try {
      return new Intl.NumberFormat(currency.locale, defaultOptions).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency.symbol}${amount.toFixed(2)}`;
    }
  };

  const getSymbol = () => currency.symbol;

  const getCurrencyName = () => currency.name;

  const availableCurrencies = Object.values(CURRENCIES);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        format,
        getSymbol,
        getCurrencyName,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * Utility hook for simple currency symbol access
 */
export function useCurrencySymbol(): string {
  const { getSymbol } = useCurrency();
  return getSymbol();
}

/**
 * Utility hook for formatting amounts
 */
export function useFormatCurrency() {
  const { format } = useCurrency();
  return format;
}

