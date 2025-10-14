/**
 * Add/Edit Staff Modal
 * Supports Simple Mode (Basic 100%, no deductions) and Advanced Mode (Custom salary structure)
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  IndianRupee,
  Calendar,
  MapPin,
  AlertCircle,
  Settings,
} from "lucide-react";
import { staffService } from "@/lib/staffService";
import { Staff, StaffFormData, STAFF_DEFAULTS } from "@/types/staff";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStaffAdded: (staff: Staff) => void;
  editStaff?: Staff | null; // For edit mode
}

export function AddStaffModal({
  open,
  onOpenChange,
  onStaffAdded,
  editStaff,
}: AddStaffModalProps) {
  const isEditMode = !!editStaff;

  const [salaryMode, setSalaryMode] = useState<"simple" | "advanced">("simple");
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    phone: "",
    email: "",
    position: "",
    monthlySalary: 0,
    hireDate: new Date().toISOString().split("T")[0],
    address: "",
    emergencyContact: "",
    notes: "",
    isActive: true,
    isSimpleMode: true,
    basicPercent: STAFF_DEFAULTS.BASIC_PERCENT,
    hraPercent: STAFF_DEFAULTS.HRA_PERCENT,
    allowancesAmount: STAFF_DEFAULTS.ALLOWANCES_AMOUNT,
    includePF: false,
    pfPercent: STAFF_DEFAULTS.PF_PERCENT,
    includeESI: false,
    esiPercent: STAFF_DEFAULTS.ESI_PERCENT,
    allowedLeaveDays: STAFF_DEFAULTS.ALLOWED_LEAVE_DAYS,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Load edit data
  useEffect(() => {
    if (editStaff) {
      const isSimple =
        editStaff.basicPercent === 100 &&
        editStaff.hraPercent === 0 &&
        !editStaff.includePF &&
        !editStaff.includeESI;

      setSalaryMode(isSimple ? "simple" : "advanced");

      setFormData({
        name: editStaff.name,
        phone: editStaff.phone,
        email: editStaff.email || "",
        position: editStaff.position,
        monthlySalary: editStaff.monthlySalary,
        hireDate: editStaff.hireDate,
        address: editStaff.address || "",
        emergencyContact: editStaff.emergencyContact || "",
        notes: editStaff.notes || "",
        isActive: editStaff.isActive,
        isSimpleMode: isSimple,
        basicPercent: editStaff.basicPercent || STAFF_DEFAULTS.BASIC_PERCENT,
        hraPercent: editStaff.hraPercent || STAFF_DEFAULTS.HRA_PERCENT,
        allowancesAmount: editStaff.allowancesAmount || STAFF_DEFAULTS.ALLOWANCES_AMOUNT,
        includePF: editStaff.includePF || false,
        pfPercent: editStaff.pfPercent || STAFF_DEFAULTS.PF_PERCENT,
        includeESI: editStaff.includeESI || false,
        esiPercent: editStaff.esiPercent || STAFF_DEFAULTS.ESI_PERCENT,
        allowedLeaveDays: editStaff.allowedLeaveDays || STAFF_DEFAULTS.ALLOWED_LEAVE_DAYS,
      });
    }
  }, [editStaff]);

  // Reset form on mode change
  const handleModeChange = (mode: "simple" | "advanced") => {
    setSalaryMode(mode);
    if (mode === "simple") {
      setFormData((prev) => ({
        ...prev,
        isSimpleMode: true,
        basicPercent: 100,
        hraPercent: 0,
        allowancesAmount: 0,
        includePF: false,
        includeESI: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        isSimpleMode: false,
      }));
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: string[] = [];
    
    if (!formData.name.trim()) {
      validationErrors.push("Name is required");
    }

    if (!formData.phone.trim()) {
      validationErrors.push("Phone number is required");
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      validationErrors.push("Invalid phone number format");
    }

    if (!formData.position.trim()) {
      validationErrors.push("Position is required");
    }

    if (formData.monthlySalary <= 0) {
      validationErrors.push("Monthly salary must be greater than zero");
    }

    if (salaryMode === "advanced") {
      if (formData.basicPercent + formData.hraPercent > 100) {
        validationErrors.push("Basic % + HRA % cannot exceed 100%");
      }

      if (formData.basicPercent < 0 || formData.basicPercent > 100) {
        validationErrors.push("Basic % must be between 0 and 100");
      }

      if (formData.hraPercent < 0 || formData.hraPercent > 100) {
        validationErrors.push("HRA % must be between 0 and 100");
      }

      if (formData.pfPercent < 0 || formData.pfPercent > 100) {
        validationErrors.push("PF % must be between 0 and 100");
      }

      if (formData.esiPercent < 0 || formData.esiPercent > 100) {
        validationErrors.push("ESI % must be between 0 and 100");
      }
    }

    if (formData.allowedLeaveDays < 0) {
      validationErrors.push("Allowed leave days cannot be negative");
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let staff: Staff;

      if (isEditMode && editStaff) {
        // Update existing staff
        const updated = await staffService.updateStaff(editStaff.id, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || undefined,
          position: formData.position,
          monthlySalary: formData.monthlySalary,
          hireDate: formData.hireDate,
          address: formData.address || undefined,
          emergencyContact: formData.emergencyContact || undefined,
          notes: formData.notes || undefined,
          isActive: formData.isActive,
          basicPercent: formData.basicPercent,
          hraPercent: formData.hraPercent,
          allowancesAmount: formData.allowancesAmount,
          includePF: formData.includePF,
          pfPercent: formData.pfPercent,
          includeESI: formData.includeESI,
          esiPercent: formData.esiPercent,
          allowedLeaveDays: formData.allowedLeaveDays,
        });

        if (!updated) {
          throw new Error("Failed to update staff");
        }

        staff = updated;
        toast.success("Staff updated successfully!");
      } else {
        // Add new staff
        staff = await staffService.addStaff(formData);
        toast.success("Staff added successfully!", {
          description: `${formData.name} has been added to your staff list.`,
        });
      }

      onStaffAdded(staff);
      handleClose();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(isEditMode ? "Failed to update staff" : "Failed to add staff", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSalaryMode("simple");
    setFormData({
      name: "",
      phone: "",
      email: "",
      position: "",
      monthlySalary: 0,
      hireDate: new Date().toISOString().split("T")[0],
      address: "",
      emergencyContact: "",
      notes: "",
      isActive: true,
      isSimpleMode: true,
      basicPercent: STAFF_DEFAULTS.BASIC_PERCENT,
      hraPercent: STAFF_DEFAULTS.HRA_PERCENT,
      allowancesAmount: STAFF_DEFAULTS.ALLOWANCES_AMOUNT,
      includePF: false,
      pfPercent: STAFF_DEFAULTS.PF_PERCENT,
      includeESI: false,
      esiPercent: STAFF_DEFAULTS.ESI_PERCENT,
      allowedLeaveDays: STAFF_DEFAULTS.ALLOWED_LEAVE_DAYS,
    });
    setErrors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update staff member information and salary configuration"
              : "Add a new staff member with salary configuration"}
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={salaryMode} onValueChange={(v) => handleModeChange(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="simple">Simple Mode</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
            </TabsList>

            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                      placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                      placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                      placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="position">
                      Position/Designation <span className="text-red-500">*</span>
              </Label>
                    <Input
                      id="position"
                      placeholder="Manager, Sales Executive, etc."
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Date of Joining</Label>
                    <Input
                      id="hireDate"
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.emergencyContact}
                      onChange={(e) =>
                        setFormData({ ...formData, emergencyContact: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Salary Configuration */}
              <TabsContent value="simple" className="mt-0">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                    Salary Configuration (Simple Mode)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="monthlySalary">
                      Monthly Salary (CTC) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="monthlySalary"
                      type="number"
                      placeholder="25000"
                      value={formData.monthlySalary || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      In simple mode, 100% of salary is treated as Basic. No PF/ESI deductions.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Salary Configuration (Advanced Mode)
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="monthlySalaryAdv">
                      Monthly Salary (CTC) <span className="text-red-500">*</span>
              </Label>
              <Input
                      id="monthlySalaryAdv"
                type="number"
                      placeholder="25000"
                      value={formData.monthlySalary || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlySalary: parseFloat(e.target.value) || 0 })
                      }
                      required
              />
            </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basicPercent">Basic Salary (%)</Label>
                      <Input
                        id="basicPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.basicPercent}
                        onChange={(e) =>
                          setFormData({ ...formData, basicPercent: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount: ₹
                        {((formData.monthlySalary * formData.basicPercent) / 100).toFixed(2)}
                      </p>
                    </div>

            <div className="space-y-2">
                      <Label htmlFor="hraPercent">HRA (%)</Label>
              <Input
                        id="hraPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.hraPercent}
                        onChange={(e) =>
                          setFormData({ ...formData, hraPercent: parseFloat(e.target.value) || 0 })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Amount: ₹{((formData.monthlySalary * formData.hraPercent) / 100).toFixed(2)}
                      </p>
            </div>
          </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowancesAmount">Other Allowances (Fixed Amount)</Label>
                    <Input
                      id="allowancesAmount"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.allowancesAmount || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, allowancesAmount: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium">Statutory Deductions</h4>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="includePF" className="cursor-pointer">
                          Provident Fund (PF)
            </Label>
                        <p className="text-xs text-muted-foreground">
                          Deduct PF from salary
                        </p>
                      </div>
                      <Switch
                        id="includePF"
                        checked={formData.includePF}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, includePF: checked })
                        }
                      />
                    </div>

                    {formData.includePF && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="pfPercent">PF Percentage</Label>
                        <Input
                          id="pfPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.pfPercent}
                  onChange={(e) =>
                            setFormData({ ...formData, pfPercent: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="includeESI" className="cursor-pointer">
                          Employee State Insurance (ESI)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Deduct ESI from salary
                        </p>
                      </div>
                      <Switch
                        id="includeESI"
                        checked={formData.includeESI}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, includeESI: checked })
                        }
                      />
                    </div>

                    {formData.includeESI && (
                      <div className="ml-6 space-y-2">
                        <Label htmlFor="esiPercent">ESI Percentage</Label>
                        <Input
                          id="esiPercent"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.esiPercent}
                  onChange={(e) =>
                            setFormData({ ...formData, esiPercent: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Leave Configuration */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Leave Configuration
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="allowedLeaveDays">Allowed Paid Leave Days (Per Month)</Label>
                  <Input
                    id="allowedLeaveDays"
                    type="number"
                    min="0"
                    value={formData.allowedLeaveDays}
                  onChange={(e) =>
                      setFormData({ ...formData, allowedLeaveDays: parseInt(e.target.value) || 0 })
                  }
                />
                  <p className="text-xs text-muted-foreground">
                    Number of paid leave days allowed per month (default: 2)
                  </p>
            </div>
          </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Additional Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter residential address"
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes or remarks"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>

                  {isEditMode && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="isActive" className="cursor-pointer">
                          Active Status
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Is this staff member currently active?
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update Staff" : "Add Staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
