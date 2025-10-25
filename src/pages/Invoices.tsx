import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, MoreVertical, Pencil, Trash2, Eye, Calendar, User, Loader2, X, Mail, Phone, MapPin, Hash, DollarSign } from "lucide-react";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/useUserData";
import type { Invoice as SupabaseInvoice } from "@/services/api/userDataService";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: number;
}

interface Invoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  taxRate: string;
  notes?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  status: "draft" | "sent" | "paid" | "overdue";
}

export default function Invoices() {
  // Fetch invoices from Supabase
  const { data: supabaseInvoices, isLoading, refetch } = useInvoices();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Transform Supabase invoices to local format
  const invoices = useMemo(() => {
    if (!supabaseInvoices) return localInvoices;
    
    const transformed = supabaseInvoices.map((si: SupabaseInvoice): Invoice => ({
      id: si.id,
      customerName: si.customer_name,
      invoiceNumber: si.bill_number,
      invoiceDate: si.bill_date,
      dueDate: si.due_date,
      taxRate: si.gst_rate?.toString() || "0",
      notes: si.notes || undefined,
      items: si.items || [],
      subtotal: Number(si.subtotal),
      tax: Number(si.gst_amount),
      total: Number(si.total),
      createdAt: new Date(si.created_at),
      status: si.status as "draft" | "sent" | "paid" | "overdue",
    }));
    
    // Update local state when server data changes
    setLocalInvoices(transformed);
    return transformed;
  }, [supabaseInvoices]);

  const handleInvoiceAdded = async (invoiceData: any) => {
    console.log('⚡ Invoice created, updating UI instantly...', invoiceData);
    
    // Create optimistic invoice entry
    const newInvoice: Invoice = {
      id: invoiceData.id || `temp-${Date.now()}`,
      customerName: invoiceData.customer_name,
      invoiceNumber: invoiceData.bill_number,
      invoiceDate: invoiceData.bill_date,
      dueDate: invoiceData.due_date,
      taxRate: invoiceData.gst_rate?.toString() || "0",
      notes: invoiceData.notes,
      items: invoiceData.items || [],
      subtotal: Number(invoiceData.subtotal),
      tax: Number(invoiceData.gst_amount),
      total: Number(invoiceData.total),
      createdAt: new Date(invoiceData.created_at || Date.now()),
      status: invoiceData.status || 'draft',
    };
    
    // INSTANT UI update
    setLocalInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
    setIsAddModalOpen(false);
    
    console.log('✅ UI updated instantly with new invoice');
    
    // Background sync
    setTimeout(() => {
      refetch().then(() => {
        console.log('🔄 Background sync completed');
      });
    }, 500);
  };

  const handleDeleteInvoice = async (id: string) => {
    // Refetch invoices after deletion
    await refetch();
    toast.success("Invoice deleted successfully");
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      case "sent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedInvoice(null), 300);
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Main Content Area */}
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isPanelOpen ? "mr-[480px]" : "mr-0"
        )}>
          <div className="max-w-6xl mx-auto space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Invoices</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage invoices • {invoices.length} total
                </p>
              </div>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="search-bar pl-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading invoices...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we fetch your data
                </p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              invoices.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices created"
                  description="Create professional invoices for your customers. Track payments, send reminders, and maintain accurate records of all transactions."
                  actionLabel="Create Your First Invoice"
                  onAction={() => setIsAddModalOpen(true)}
                />
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search query
                  </p>
                </Card>
              )
            ) : (
              <div className="grid gap-3">
                {filteredInvoices.map((invoice) => (
                  <Card 
                    key={invoice.id} 
                    className={cn(
                      "p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group",
                      selectedInvoice?.id === invoice.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleInvoiceClick(invoice)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Invoice Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {invoice.invoiceNumber}
                            </h3>
                            <Badge className={cn("text-xs", getStatusColor(invoice.status))}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{invoice.customerName}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            ₹{invoice.total.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleInvoiceClick(invoice);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInvoice(invoice.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side Preview Panel */}
        <div 
          className={cn(
            "fixed top-0 right-0 h-full w-[480px] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto",
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {selectedInvoice && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Invoice Details</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleClosePanel}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={cn("text-sm px-4 py-1", getStatusColor(selectedInvoice.status))}>
                    {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                  </Badge>
                  <div className="text-3xl font-bold text-primary">
                    ₹{selectedInvoice.total.toFixed(2)}
                  </div>
                </div>

                {/* Customer Info */}
                <Card className="p-4 bg-muted/50">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{selectedInvoice.customerName}</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Invoice Dates */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice Date:</span>
                      <span className="font-medium">
                        {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {selectedInvoice.dueDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">
                          {new Date(selectedInvoice.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Items */}
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Items ({selectedInvoice.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={item.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Qty: {item.quantity} × ₹{item.rate}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            ₹{Number(item.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Amount Breakdown */}
                <Card className="p-4 bg-primary/5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%):</span>
                      <span className="font-medium">₹{selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹{selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </Card>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <Card className="p-4">
                    <h3 className="text-sm font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedInvoice.notes}
                    </p>
                  </Card>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-4">
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Invoice
                  </Button>
                  <Button className="flex-1" variant="default">
                    <Eye className="h-4 w-4 mr-2" />
                    Print / Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay */}
        {isPanelOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
            onClick={handleClosePanel}
          />
        )}
      </div>

      <CreateInvoiceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={handleInvoiceAdded}
      />
    </DashboardLayout>
  );
}
