// Invoice System - Premium Apple-Inspired Design
// Clean, minimal, and efficient invoice creation

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  ChevronDown,
  Package
} from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { 
  calculateLineItemAmount, 
  calculateInvoiceTotals,
  validateGSTIN,
  determineGSTType,
  generateInvoiceNumber,
  validateInvoiceData,
  createCurrencyContext,
  calculateDueDate,
  INDIAN_STATES,
  GST_RATES,
  PAYMENT_TERMS,
  DEFAULT_TERMS_CONDITIONS,
  DEFAULT_PAYMENT_INSTRUCTIONS
} from "@/lib/invoiceUtils";
import { 
  INVOICE_TEMPLATES, 
  renderInvoiceTemplate
} from "@/lib/invoiceTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessContext } from "@/contexts/BusinessContext";
import ProductSelectionModal, { SelectedProduct } from "@/components/ProductSelectionModal";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (invoiceData: any) => void;
}

export default function CreateInvoiceModal({ open, onOpenChange, onSuccess }: CreateInvoiceModalProps) {
  // Get business profile from context
  const { businessProfile } = useBusinessContext();
  
  // Form State
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(calculateDueDate(new Date(), 30).toISOString().split('T')[0]);
  
  // Business & Customer - Initialize with business profile data
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessGST, setBusinessGST] = useState("");
  const [businessState, setBusinessState] = useState("");
  
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerGST, setCustomerGST] = useState("");
  const [customerState, setCustomerState] = useState("");
  
  // Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", name: "", description: "", hsn: "", quantity: "1", price: "0", discount: "0", amount: "0" }
  ]);
  
  // Tax & Additional
  const [includeGST, setIncludeGST] = useState(false);
  const [gstType, setGstType] = useState<"none" | "igst" | "cgst_sgst">("none");
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS_CONDITIONS);
  const [paymentInstructions, setPaymentInstructions] = useState(DEFAULT_PAYMENT_INSTRUCTIONS);
  const [bankDetails, setBankDetails] = useState("");
  
  // Template & UI
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [isSaving, setIsSaving] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    business: false,
    customer: true,
    items: true,
    tax: false,
    additional: false
  });
  
  // Auto-generate invoice number
  useEffect(() => {
    setBillNumber(generateInvoiceNumber("INV", 0, new Date().getFullYear()));
  }, []);
  
  // 🎯 AUTO-POPULATE BUSINESS DETAILS FROM SETTINGS
  useEffect(() => {
    if (businessProfile && open) {
      console.log('🏢 Auto-populating business details from Settings:', businessProfile);
      
      // Populate business information from settings
      if (businessProfile.businessName) {
        setBusinessName(businessProfile.businessName);
      }
      
      if (businessProfile.phone) {
        setBusinessPhone(businessProfile.phone);
      }
      
      if (businessProfile.email) {
        setBusinessEmail(businessProfile.email);
      }
      
      if (businessProfile.gstNumber) {
        setBusinessGST(businessProfile.gstNumber);
      }
      
      if (businessProfile.state) {
        setBusinessState(businessProfile.state);
      }
      
      // Build complete business address
      const addressParts = [
        businessProfile.address,
        businessProfile.city,
        businessProfile.state,
        businessProfile.pincode
      ].filter(Boolean);
      
      if (addressParts.length > 0) {
        setBusinessAddress(addressParts.join(', '));
      }
      
      // Set currency from business settings
      if (businessProfile.currency) {
        setCurrencyCode(businessProfile.currency);
      }
      
      toast.success("Business details loaded from Settings", {
        description: `${businessProfile.businessName || 'Your business'} information auto-filled`,
        duration: 2000,
      });
    }
  }, [businessProfile, open]);
  
  // Auto-determine GST type
  useEffect(() => {
    if (includeGST && (businessGST || businessState) && (customerGST || customerState)) {
      const detectedType = determineGSTType(businessGST, customerGST, businessState, customerState);
      setGstType(detectedType);
    }
  }, [businessGST, customerGST, businessState, customerState, includeGST]);
  
  // Calculations
  const calculations = useMemo(() => {
    return calculateInvoiceTotals(items, gstRate, gstType, includeGST);
  }, [items, gstRate, gstType, includeGST]);
  
  const currency = useMemo(() => createCurrencyContext(currencyCode), [currencyCode]);
  
  // Invoice data for preview
  const invoiceData = useMemo(() => ({
    billNumber,
    billDate,
    dueDate,
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    businessGST,
    businessState,
    customerName,
    customerAddress,
    customerPhone,
    customerEmail,
    customerGST,
    customerState,
    items,
    subtotal: calculations.subtotal,
    gstAmount: calculations.gstAmount,
    cgst: calculations.cgst,
    sgst: calculations.sgst,
    igst: calculations.igst,
    total: calculations.total,
    gstType,
    gstRate,
    includeGST,
    notes,
    termsAndConditions,
    paymentInstructions,
    bankDetails,
    templateId: selectedTemplate,
    currencyCode,
    currencySymbol: currency.symbol
  }), [
    billNumber, billDate, dueDate, businessName, businessAddress, businessPhone, businessEmail,
    businessGST, businessState, customerName, customerAddress, customerPhone, customerEmail,
    customerGST, customerState, items, calculations, gstType, gstRate, includeGST,
    notes, termsAndConditions, paymentInstructions, bankDetails, selectedTemplate,
    currencyCode, currency.symbol
  ]);
  
  // Item handlers
  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "price" || field === "discount") {
          const amount = calculateLineItemAmount(updated.quantity, updated.price, updated.discount);
          updated.amount = amount.toString();
        }
        return updated;
      }
      return item;
    }));
  };
  
  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      name: "",
      description: "",
      hsn: "",
      quantity: "1",
      price: "0",
      discount: "0",
      amount: "0"
    }]);
  };
  
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };
  
  // Handle products selected from inventory
  const handleProductsSelected = (selectedProducts: SelectedProduct[]) => {
    console.log('🛒 Products selected from inventory:', selectedProducts);
    
    // Convert selected products to invoice items
    const newItems: InvoiceItem[] = selectedProducts.map(product => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      description: product.description || "",
      hsn: product.hsn || "",
      quantity: product.quantity.toString(),
      price: product.price.toString(),
      discount: product.discount.toString(),
      amount: product.amount.toString()
    }));
    
    // Add to existing items
    setItems(prev => [...prev, ...newItems]);
    
    toast.success(`Added ${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''} to invoice`, {
      description: selectedProducts.map(p => `${p.name} (${p.quantity}x)`).join(', ')
    });
  };
  
  const handlePaymentTermsChange = (days: number) => {
    const newDueDate = calculateDueDate(new Date(billDate), days);
    setDueDate(newDueDate.toISOString().split('T')[0]);
  };
  
  // Save invoice
  const handleSave = async () => {
    const validation = validateInvoiceData(invoiceData);
    if (!validation.isValid) {
      toast.error("Validation Failed", { description: validation.errors[0] });
      return;
    }
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Map items to the format expected by database
      const itemsData = items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        description: item.name,
        quantity: item.quantity,
        rate: item.price,
        amount: parseFloat(item.amount),
      }));

      // Insert into 'bills' table (correct table name)
      const billData = {
        id: `bill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ✅ Generate unique ID
        user_id: user.id,
        bill_number: billNumber,
        template: selectedTemplate,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        customer_gst: customerGST || null,
        customer_address: customerAddress || null,
        bill_date: billDate,
        due_date: dueDate,
        business_name: businessName,
        business_address: businessAddress,
        business_gst: businessGST || null,
        business_phone: businessPhone,
        business_email: businessEmail || null,
        gst_type: gstType,
        include_gst: gstRate > 0,
        gst_rate: gstRate,
        items: itemsData, // Store as JSONB
        subtotal: calculations.subtotal,
        gst_amount: calculations.gstAmount,
        total: calculations.total,
        notes: notes || null,
        terms_and_conditions: termsAndConditions || null,
        payment_instructions: paymentInstructions || null,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
        deleted_at: null,
        device_id: null, // ✅ Add device_id field
      };

      console.log('🚀 Creating invoice in bills table:', billData);

      const { data: invoice, error: invoiceError } = await (supabase as any)
        .from('bills')
        .insert(billData)
        .select()
        .single();
      
      if (invoiceError) {
        console.error('❌ Error creating invoice:', invoiceError);
        throw invoiceError;
      }
      
      console.log('✅ Invoice created successfully:', invoice);
      
      toast.success("Invoice Created!", {
        description: `${billNumber} for ${currency.symbol}${calculations.total.toFixed(2)}`
      });
      
      onOpenChange(false);
      onSuccess?.(invoice); // Pass the created invoice to parent
    } catch (error: any) {
      console.error('❌ Failed to save invoice:', error);
      toast.error("Failed to Save", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0 [&>button]:top-3 [&>button]:right-3">
        <style>{`
          @media print {
            /* Hide everything except the invoice preview */
            body * {
              visibility: hidden;
            }
            #invoice-preview-container,
            #invoice-preview-container * {
              visibility: visible;
            }
            #invoice-preview-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Remove any transforms/scaling for print */
            #invoice-preview-content {
              transform: none !important;
              width: 210mm !important;
              margin: 0 auto !important;
            }
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b print:hidden">
          <div>
            <h2 className="text-lg font-semibold">Create Invoice</h2>
            <p className="text-sm text-muted-foreground">Professional invoice in seconds</p>
          </div>
          <div className="flex items-center gap-2 mr-8">
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-2">
          {/* Left: Form */}
          <ScrollArea className="h-full border-r bg-muted/30 print:hidden">
            <div className="p-6 space-y-4">
              
              {/* Basic Info */}
              <div className="bg-card rounded-xl p-5 shadow-sm border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Invoice Number</Label>
                    <Input
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      className="h-9 text-sm"
                      placeholder="INV-2025-0001"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Currency</Label>
                    <Select value={currencyCode} onValueChange={setCurrencyCode}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                        <SelectItem value="GBP">£ GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Invoice Date</Label>
                    <Input
                      type="date"
                      value={billDate}
                      onChange={(e) => setBillDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Business Info */}
              <div className="bg-card rounded-xl shadow-sm border">
                <button
                  onClick={() => toggleSection('business')}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Your Business</span>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                      Auto-filled from Settings
                    </Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.business ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.business && (
                  <div className="px-5 pb-5 space-y-3 border-t">
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-medium">Business Name *</Label>
                        <Input
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="ABC Corporation"
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-medium">Address</Label>
                        <Input
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Street, City, State, PIN"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Phone</Label>
                        <Input
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Email</Label>
                        <Input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="business@example.com"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">GSTIN</Label>
                        <Input
                          value={businessGST}
                          onChange={(e) => setBusinessGST(e.target.value.toUpperCase())}
                          className="h-9 text-sm"
                          placeholder="22AAAAA0000A1Z5"
                          maxLength={15}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">State</Label>
                        <Select value={businessState} onValueChange={setBusinessState}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Customer Info */}
              <div className="bg-card rounded-xl shadow-sm border">
                <button
                  onClick={() => toggleSection('customer')}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold">Customer</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.customer ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.customer && (
                  <div className="px-5 pb-5 space-y-3 border-t">
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-medium">Customer Name *</Label>
                        <Input
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-1.5">
                        <Label className="text-xs font-medium">Address</Label>
                        <Input
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Street, City, State, PIN"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Phone</Label>
                        <Input
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Email</Label>
                        <Input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="customer@example.com"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">GSTIN</Label>
                        <Input
                          value={customerGST}
                          onChange={(e) => setCustomerGST(e.target.value.toUpperCase())}
                          className="h-9 text-sm"
                          placeholder="29BBBBB0000B1Z5"
                          maxLength={15}
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">State</Label>
                        <Select value={customerState} onValueChange={setCustomerState}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map(state => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Items */}
              <div className="bg-card rounded-xl shadow-sm border">
                <div className="flex items-center justify-between p-4 border-b">
                  <span className="text-sm font-semibold">Items</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setIsProductModalOpen(true)} 
                      size="sm" 
                      variant="default"
                      className="h-8 text-xs"
                    >
                      <Package className="h-3.5 w-3.5 mr-1.5" />
                      Select Products
                    </Button>
                    <Button onClick={addItem} size="sm" variant="ghost" className="h-8 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Manually
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg space-y-2.5">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                        {items.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          placeholder="Item name"
                          className="h-8 text-sm bg-card"
                        />
                      
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          placeholder="Qty"
                          className="h-8 text-sm bg-card"
                        />
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", e.target.value)}
                          placeholder="Price"
                          className="h-8 text-sm bg-card"
                        />
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, "discount", e.target.value)}
                          placeholder="Disc%"
                          className="h-8 text-sm bg-card"
                        />
                        <Input
                          value={`${currency.symbol}${parseFloat(item.amount).toFixed(2)}`}
                          disabled
                          className="h-8 text-sm bg-white font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tax Summary */}
              <div className="bg-card rounded-xl p-5 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Tax & Total</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">GST</span>
                    <button
                      onClick={() => setIncludeGST(!includeGST)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${includeGST ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${includeGST ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {includeGST && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Select value={gstType} onValueChange={(value: any) => setGstType(value)}>
                      <SelectTrigger className="h-8 text-xs bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No GST</SelectItem>
                        <SelectItem value="igst">IGST</SelectItem>
                        <SelectItem value="cgst_sgst">CGST+SGST</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={gstRate.toString()} onValueChange={(v) => setGstRate(parseInt(v))}>
                      <SelectTrigger className="h-8 text-xs bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_RATES.map(rate => (
                          <SelectItem key={rate.value} value={rate.value.toString()}>
                            {rate.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{currency.symbol}{calculations.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {includeGST && gstType === "cgst_sgst" && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">CGST ({gstRate / 2}%)</span>
                        <span>{currency.symbol}{calculations.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">SGST ({gstRate / 2}%)</span>
                        <span>{currency.symbol}{calculations.sgst.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  {includeGST && gstType === "igst" && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">IGST ({gstRate}%)</span>
                      <span>{currency.symbol}{calculations.igst.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {currency.symbol}{calculations.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Template Selector */}
              <div className="bg-card rounded-xl p-4 shadow-sm border">
                <Label className="text-xs font-medium mb-3 block">Template</Label>
                <div className="grid grid-cols-3 gap-2">
                  {INVOICE_TEMPLATES.slice(0, 6).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        selectedTemplate === template.id 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div
                        className="h-12 rounded mb-1.5"
                        style={{ background: template.previewColor }}
                      />
                      <div className="text-xs font-medium truncate">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Additional (Collapsible) */}
              <div className="bg-card rounded-xl shadow-sm border">
                <button
                  onClick={() => toggleSection('additional')}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-semibold">Additional Info</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.additional ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.additional && (
                  <div className="px-5 pb-5 space-y-3 border-t pt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Notes</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Terms & Conditions</Label>
                      <Textarea
                        value={termsAndConditions}
                        onChange={(e) => setTermsAndConditions(e.target.value)}
                        className="text-sm resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Payment Instructions</Label>
                      <Textarea
                        value={paymentInstructions}
                        onChange={(e) => setPaymentInstructions(e.target.value)}
                        className="text-sm resize-none"
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Bank Details</Label>
                      <Textarea
                        value={bankDetails}
                        onChange={(e) => setBankDetails(e.target.value)}
                        placeholder="Account details..."
                        className="text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </ScrollArea>
          
          {/* Right: Live Preview */}
          <div className="bg-muted/50 flex flex-col overflow-hidden print:bg-white">
            <div className="px-4 py-3 bg-card/80 backdrop-blur border-b flex items-center justify-between flex-shrink-0 print:hidden">
              <span className="text-xs font-medium">Live Preview</span>
              <Badge variant="secondary" className="text-xs">{INVOICE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden" id="invoice-preview-container">
              <div className="p-6 min-h-full flex justify-center print:p-0">
                <div 
                  id="invoice-preview-content"
                  className="bg-card shadow-2xl rounded-lg overflow-visible print:shadow-none print:rounded-none" 
                  style={{ 
                    width: "210mm",
                    minHeight: "297mm",
                    transform: "scale(0.7)",
                    transformOrigin: "top center"
                  }}
                >
                  <div className="w-full">
                    {renderInvoiceTemplate(selectedTemplate, invoiceData)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSelectProducts={handleProductsSelected}
      />
    </Dialog>
  );
}
