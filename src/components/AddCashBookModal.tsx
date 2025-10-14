import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface CashBookEntryData {
  type: "cash_in" | "cash_out";
  amount: string;
  category: string;
  description?: string;
  date: string;
  paymentMethod: string;
  reference?: string;
}

interface AddCashBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryAdded?: (data: CashBookEntryData) => void;
  defaultType?: "cash_in" | "cash_out";
  editData?: CashBookEntryData & { id: string };
  onEntryUpdated?: (data: CashBookEntryData & { id: string }) => void;
}

export function AddCashBookModal({ open, onOpenChange, onEntryAdded, defaultType, editData, onEntryUpdated }: AddCashBookModalProps) {
  const [formData, setFormData] = useState({
    type: (defaultType || "cash_in") as "cash_in" | "cash_out",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    reference: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!editData;

  // Update form type when defaultType changes and sheet opens
  useEffect(() => {
    if (open && defaultType) {
      setFormData(prev => ({ ...prev, type: defaultType }));
    }
  }, [open, defaultType]);

  // Pre-fill form data when editing
  useEffect(() => {
    if (open && editData) {
      setFormData({
        type: editData.type,
        amount: editData.amount,
        category: editData.category,
        description: editData.description || "",
        date: editData.date,
        paymentMethod: editData.paymentMethod,
        reference: editData.reference || "",
      });
    } else if (open && !editData) {
      // Reset form when opening for new entry
      setFormData({
        type: (defaultType || "cash_in") as "cash_in" | "cash_out",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        reference: "",
      });
    }
  }, [open, editData, defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      if (isEditMode && editData) {
        // Update existing entry
        onEntryUpdated?.({ ...formData, id: editData.id });
        
        toast.success("Transaction updated successfully!", {
          description: `₹${parseFloat(formData.amount).toFixed(2)} has been updated.`,
        });
      } else {
        // Add new entry
        onEntryAdded?.(formData);
        
        const typeLabel = formData.type === "cash_in" ? "Cash In" : "Cash Out";
        toast.success(`${typeLabel} entry added successfully!`, {
          description: `₹${parseFloat(formData.amount).toFixed(2)} has been recorded.`,
        });
      }

      // Reset form
      setFormData({
        type: "cash_in",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "cash",
        reference: "",
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add entry", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-4 py-4 z-10">
          <h2 className={`text-lg font-semibold ${
            formData.type === "cash_in" ? "text-green-600" : "text-red-600"
          }`}>
            {isEditMode ? "Edit" : ""} {formData.type === "cash_in" ? "In Entry" : "Out Entry"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-60px)]">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-normal text-foreground">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter Amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-12 pl-8 bg-background border-border"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-normal text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter Details (Item Name, Bill No, Quantity, etc)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] resize-none bg-background border-border"
              />
            </div>

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label className="text-sm font-normal text-foreground">
                Payment Mode
              </Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cash"
                    checked={formData.paymentMethod === "cash"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Cash</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={formData.paymentMethod === "online"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Online</span>
                </label>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-normal text-foreground">
                Date
              </Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-12 bg-background border-border pr-10"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Attach Bill */}
            <div className="space-y-2">
              <Label className="text-sm font-normal text-foreground">
                Attach Bill
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Only PNG or JPG file format supported</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="sticky bottom-0 bg-background border-t px-4 py-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.amount}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium"
            >
              {isSubmitting ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}


