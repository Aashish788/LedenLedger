import { useState } from "react";
import { X, Phone, Globe, Briefcase, MapPin, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PartyProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  party: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    gstNumber?: string;
    type: "customer" | "supplier";
  };
  onUpdate?: (data: any) => void;
  onDelete?: () => void;
}

export function PartyProfileModal({
  open,
  onOpenChange,
  party,
  onUpdate,
  onDelete,
}: PartyProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: party.phone || "",
    language: "English",
    gstNumber: party.gstNumber || "",
    shippingAddress: party.address || "",
    billingAddress: party.address || "",
  });

  const handleSave = () => {
    onUpdate?.(formData);
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${party.name}?`)) {
      onDelete?.();
      onOpenChange(false);
      toast.success("Party deleted successfully");
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-orange-600",
      "bg-teal-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#1a1a1a] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 z-10 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Party Profile</h2>
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

      {/* Content */}
      <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Party Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-800">
            <div
              className={`w-14 h-14 rounded-full ${getAvatarColor(
                party.name
              )} flex items-center justify-center text-white font-bold text-xl`}
            >
              {getInitials(party.name)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{party.name}</h3>
              <p className="text-sm text-gray-400 capitalize">{party.type}</p>
            </div>
          </div>

          {/* Edit Profile Button */}
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="h-12 bg-transparent border-gray-700 text-white focus:border-blue-500"
              />
            ) : (
              <div className="text-base text-white">{formData.phone || "-"}</div>
            )}
          </div>

          {/* SMS & WhatsApp Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              SMS & WhatsApp language
            </Label>
            {isEditing ? (
              <Select
                value={formData.language}
                onValueChange={(value) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger className="h-12 bg-transparent border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Regional">Regional</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="text-base text-white">{formData.language}</div>
            )}
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              GST Number
            </Label>
            {isEditing ? (
              <Input
                type="text"
                value={formData.gstNumber}
                onChange={(e) =>
                  setFormData({ ...formData, gstNumber: e.target.value })
                }
                placeholder="Enter GST Number"
                className="h-12 bg-transparent border-gray-700 text-white focus:border-blue-500"
              />
            ) : (
              <div className="text-base text-white">{formData.gstNumber || "-"}</div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Shipping Address
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                placeholder="Enter Shipping Address"
                className="min-h-[80px] bg-transparent border-gray-700 text-white resize-none focus:border-blue-500"
              />
            ) : (
              <div className="text-base text-white">
                {formData.shippingAddress || "-"}
              </div>
            )}
          </div>

          {/* Billing Address */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Billing Address
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.billingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, billingAddress: e.target.value })
                }
                placeholder="Enter Billing Address"
                className="min-h-[80px] bg-transparent border-gray-700 text-white resize-none focus:border-blue-500"
              />
            ) : (
              <div className="text-base text-white">
                {formData.billingAddress || "-"}
              </div>
            )}
          </div>

          {/* Save Button (when editing) */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsEditing(false)}
                className="flex-1 h-12 bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          )}

          {/* Delete Party Button */}
          <div className="pt-6 border-t border-gray-800">
            <Button
              onClick={handleDelete}
              className="w-full h-12 bg-transparent hover:bg-red-900/20 text-red-500 border border-red-500/50 hover:border-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Party
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

