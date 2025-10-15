import { useState, useEffect, useRef } from "react";
import { X, Calendar, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { transactionsService } from "@/services/api/transactionsService";

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType: "gave" | "got" | null;
  customerName: string;
  partyId: string;
  partyType: "customer" | "supplier";
  onTransactionAdded?: (data: any) => void;
}

export function AddTransactionModal({
  open,
  onOpenChange,
  transactionType,
  customerName,
  partyId,
  partyType,
  onTransactionAdded,
}: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    attachment: null as File | null,
  });
  
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Focus amount input whenever modal opens
  useEffect(() => {
    if (open && amountInputRef.current) {
      // Small delay to ensure modal animation completes
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      // Convert the date string to ISO timestamp (with current time)
      const dateObj = new Date(formData.date);
      // Set to current time instead of midnight
      const now = new Date();
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      const isoDate = dateObj.toISOString();

      // Convert UI type to database type
      // UI: 'gave' | 'got'  →  Database: 'gave' | 'received'
      const dbType = transactionType === 'got' ? 'received' : 'gave';

      console.log("Saving transaction to Supabase:", {
        party_id: partyId,
        party_type: partyType,
        amount: parseFloat(formData.amount),
        type: dbType,
        description: formData.description,
        date: isoDate,
      });

      // Save to Supabase using transactionsService
      const result = await transactionsService.createTransaction({
        party_id: partyId,
        party_type: partyType,
        amount: parseFloat(formData.amount),
        type: dbType as 'gave' | 'got', // Use database type
        description: formData.description || `${transactionType === "gave" ? "Payment given to" : "Payment received from"} ${customerName}`,
        date: isoDate,
        payment_method: "cash", // Default, can be enhanced
        reference_number: null,
      });

      console.log("Transaction service result:", result);

      // Check for errors
      if (result.error) {
        throw new Error(result.error.message || 'Failed to save transaction');
      }

      if (!result.data) {
        throw new Error('No data returned from transaction creation');
      }

      console.log("Transaction saved successfully:", result.data);

      // Notify parent component with the actual saved data
      onTransactionAdded?.(result.data);

      toast.success(
        `${transactionType === "gave" ? "Payment Given" : "Payment Received"}!`,
        {
          description: `₹${parseFloat(formData.amount).toFixed(2)} recorded successfully.`,
        }
      );

      // Reset form
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        attachment: null,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
      toast.error("Failed to add transaction", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType === "image/png" || fileType === "image/jpeg") {
        setFormData({ ...formData, attachment: file });
        toast.success("File attached successfully");
      } else {
        toast.error("Only PNG or JPG files are supported");
      }
    }
  };

  if (!transactionType) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#1a1a1a] border-l border-gray-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 z-10 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-red-500">Add New Entry</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="h-[calc(100vh-80px)] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-300">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ₹
              </span>
              <Input
                ref={amountInputRef}
                id="amount"
                type="number"
                placeholder="Enter Amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="h-12 pl-10 bg-transparent border-blue-500 text-white placeholder:text-gray-500 focus:border-blue-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter Details (Item Name, Bill No, Quantity, etc)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[150px] bg-transparent border-gray-700 text-white placeholder:text-gray-600 resize-none focus:border-gray-600"
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-300">
              Date
            </Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-12 pl-12 bg-transparent border-gray-700 text-white focus:border-gray-600"
                required
              />
            </div>
          </div>

          {/* Attach Bill */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Attach Bill
            </Label>
            <div
              className="relative border-2 border-dashed border-gray-700 rounded-lg p-8 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-gray-500 mb-3" />
                <p className="text-sm font-medium text-gray-400 mb-1">
                  Click to upload
                </p>
                <p className="text-xs text-gray-600">
                  Only PNG or JPG file format supported
                </p>
              </div>
              {formData.attachment && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-green-500">
                    ✓ {formData.attachment.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-6 -mx-6 mt-8">
          <Button
            type="submit"
            className={`w-full h-12 rounded-lg font-medium transition-all duration-200 ${
              formData.amount && parseFloat(formData.amount) > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-700 hover:bg-gray-600 text-gray-400"
            }`}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

