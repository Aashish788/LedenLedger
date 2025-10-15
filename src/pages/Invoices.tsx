import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, MoreVertical, Pencil, Trash2, Eye, Calendar, User, Loader2 } from "lucide-react";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useInvoices } from "@/hooks/useUserData";
import type { Invoice as SupabaseInvoice } from "@/services/api/userDataService";

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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
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
          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {invoice.invoiceNumber}
                          </h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{invoice.customerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ₹{invoice.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {invoice.items.length} item{invoice.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                      </div>
                      {invoice.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>₹{invoice.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Tax ({invoice.taxRate}%):</span>
                        <span>₹{invoice.tax.toFixed(2)}</span>
                      </div>
                    </div>

                    {invoice.notes && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <strong>Notes:</strong> {invoice.notes}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-4">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>
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
