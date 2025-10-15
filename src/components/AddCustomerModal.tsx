import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, IndianRupee } from "lucide-react";
import { CustomerSchema, sanitizeInput, checkRateLimit } from "@/lib/security";
import { z } from "zod";
import { customersService } from "@/services/api/customersService";

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  openingBalance?: string;
  balanceType: "credit" | "debit";
}

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: (data: CustomerData) => void;
}

export function AddCustomerModal({ open, onOpenChange, onCustomerAdded }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    openingBalance: "0",
    balanceType: "credit" as "credit" | "debit",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!checkRateLimit('add_customer', 10, 60000)) {
      toast.error("Too many requests. Please wait a minute before trying again.");
      return;
    }

    // Clear previous errors
    setErrors({});

    // Validate form data
    try {
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        phone: sanitizeInput(formData.phone),
        email: sanitizeInput(formData.email),
        address: sanitizeInput(formData.address),
        gstNumber: sanitizeInput(formData.gstNumber),
        openingBalance: sanitizeInput(formData.openingBalance),
        balanceType: formData.balanceType,
      };

      CustomerSchema.parse(sanitizedData);

      setIsSubmitting(true);

      // ✅ ACTUAL SUPABASE SAVE - Real-time sync enabled!
      console.log('🚀 Saving customer to Supabase:', sanitizedData);
      
      // Calculate the amount based on opening balance and type
      const amount = parseFloat(sanitizedData.openingBalance || "0");
      const finalAmount = sanitizedData.balanceType === "credit" ? amount : -amount;
      
      // Create customer in Supabase with real-time sync
      const { data: newCustomer, error } = await customersService.createCustomer({
        name: sanitizedData.name,
        phone: sanitizedData.phone,
        email: sanitizedData.email || undefined,
        address: sanitizedData.address || undefined,
        gst_number: sanitizedData.gstNumber || undefined,
        amount: finalAmount,
      });

      if (error) {
        console.error('❌ Error saving customer:', error);
        toast.error("Failed to add customer", {
          description: error.message || "Please try again later.",
        });
        return;
      }

      console.log('✅ Customer saved successfully:', newCustomer);
      
      // Pass the sanitized data to parent component
      onCustomerAdded?.(sanitizedData);
      
      toast.success("Customer added successfully!", {
        description: `${sanitizedData.name} has been added to your customer list.`,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        openingBalance: "0",
        balanceType: "credit",
      });

      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please correct the form errors");
      } else {
        console.error('Customer creation error:', error);
        toast.error("Failed to add customer", {
          description: "Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your database. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`h-11 ${errors.name ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`h-11 ${errors.phone ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
                required
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`h-11 ${errors.email ? 'border-destructive' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* GST Number */}
            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-sm font-medium">
                GST Number (Optional)
              </Label>
              <Input
                id="gstNumber"
                placeholder="22AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="min-h-[80px] resize-none"
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
              {isSubmitting ? "Adding Customer..." : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

