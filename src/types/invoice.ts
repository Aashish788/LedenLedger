// Invoice Types

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: string;
  price: string;
  discount: string;
  amount: string;
}

export interface InvoiceData {
  billNumber: string;
  billDate: string;
  dueDate: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessGST: string;
  businessState: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  customerGST: string;
  customerState: string;
  items: InvoiceItem[];
  subtotal: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  gstType: "none" | "igst" | "cgst_sgst";
  gstRate: number;
  includeGST: boolean;
  notes: string;
  termsAndConditions: string;
  paymentInstructions: string;
  bankDetails: string;
  templateId: string;
  currencyCode: string;
  currencySymbol: string;
}

export interface InvoiceCalculation {
  subtotal: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  amountInWords: string;
}

export interface CurrencyContext {
  code: string;
  symbol: string;
  name: string;
  format: (amount: number) => string;
}
