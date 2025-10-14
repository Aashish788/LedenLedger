import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, IndianRupee } from "lucide-react";

interface SupplierData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  openingBalance?: string;
  balanceType: "credit" | "debit";
}

interface AddSupplierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierAdded?: (data: SupplierData) => void;
}

export function AddSupplierModal({ open, onOpenChange, onSupplierAdded }: AddSupplierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    openingBalance: "0",
    balanceType: "debit" as "credit" | "debit",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter supplier name");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - Replace with actual Supabase call later
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Pass the data to parent component
      onSupplierAdded?.(formData);
      
      toast.success("Supplier added successfully!", {
        description: `${formData.name} has been added to your supplier list.`,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        openingBalance: "0",
        balanceType: "debit",
      });

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add supplier", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Supplier</DialogTitle>
          <DialogDescription>
            Add a new supplier to manage your purchases and vendor relationships.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Supplier Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
                required
              />
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
                className="h-11"
                required
              />
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
                placeholder="supplier@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11"
              />
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
              {isSubmitting ? "Adding Supplier..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

