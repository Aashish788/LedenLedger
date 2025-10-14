import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, Calendar, IndianRupee, User, Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
  amount: number;
}

interface InvoiceData {
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
}

interface AddInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceAdded?: (data: InvoiceData) => void;
}

export function AddInvoiceModal({ open, onOpenChange, onInvoiceAdded }: AddInvoiceModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    taxRate: "18",
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: "1", rate: "", amount: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: "1", rate: "", amount: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            const qty = parseFloat(field === "quantity" ? value : item.quantity) || 0;
            const rate = parseFloat(field === "rate" ? value : item.rate) || 0;
            updated.amount = qty * rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(formData.taxRate) || 0;
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (items.every((item) => !item.description.trim())) {
      toast.error("Please add at least one item");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Pass the data to parent component
      const invoiceData: InvoiceData = {
        ...formData,
        items,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
      };
      onInvoiceAdded?.(invoiceData);
      
      toast.success("Invoice created successfully!", {
        description: `Invoice ${formData.invoiceNumber} for ₹${calculateTotal().toFixed(2)} has been created.`,
      });

      // Reset form
      setFormData({
        customerName: "",
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: "",
        taxRate: "18",
        notes: "",
      });
      setItems([{ id: "1", description: "", quantity: "1", rate: "", amount: 0 }]);

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create invoice", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Invoice</DialogTitle>
          <DialogDescription>
            Create a professional invoice for your customer with detailed line items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Name *
              </Label>
              <Input
                id="customerName"
                placeholder="Select or enter customer name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="h-11"
                required
              />
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-001"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="h-11"
              />
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="invoiceDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Invoice Date *
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="h-11"
                required
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Invoice Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="rounded-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-muted/30 rounded-lg">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      className="h-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                      className="h-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={`₹${item.amount.toFixed(2)}`}
                      disabled
                      className="h-10 bg-background"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">₹{calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm gap-2">
              <span>Tax:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                  className="h-8 w-20 text-right"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <span>%</span>
                <span className="font-medium w-24 text-right">₹{calculateTax().toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span className="text-primary">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes or terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[60px] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 rounded-xl"
            >
              {isSubmitting ? "Creating Invoice..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

