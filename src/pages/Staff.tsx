/**
 * Staff Management Page
 * Complete CRUD interface with search, filters, and quick actions
 */

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, UserCheck, UserX, Mail, Phone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staffService } from "@/services/api/staffService";
import { Staff } from "@/types/staff";
import { AddStaffModal } from "@/components/AddStaffModal";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useStaff } from "@/hooks/useUserData";
import type { StaffMember as SupabaseStaffMember } from "@/services/api/userDataService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function StaffPage() {
  const navigate = useNavigate();
  const { format: formatCurrency } = useCurrency();
  
  // Fetch staff from Supabase
  const { data: supabaseStaff, isLoading, refetch } = useStaff();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState("recent");
  const [localStaffMembers, setLocalStaffMembers] = useState<Staff[]>([]);

  // Transform Supabase staff to local format
  const staffMembers = useMemo(() => {
    if (!supabaseStaff) return localStaffMembers;
    
    const transformed = supabaseStaff.map((ss: SupabaseStaffMember): Staff => ({
      id: ss.id,
      name: ss.name,
      phone: ss.phone,
      email: ss.email || undefined,
      position: ss.position,
      monthlySalary: Number(ss.monthly_salary),
      hireDate: ss.hire_date,
      address: ss.address || undefined,
      emergencyContact: ss.emergency_contact || undefined,
      notes: ss.notes || undefined,
      isActive: ss.is_active ?? true,
      basicPercent: ss.basic_percent ? Number(ss.basic_percent) : undefined,
      hraPercent: ss.hra_percent ? Number(ss.hra_percent) : undefined,
      allowancesAmount: ss.allowances_amount ? Number(ss.allowances_amount) : undefined,
      includePF: ss.include_pf ?? false,
      pfPercent: ss.pf_percent ? Number(ss.pf_percent) : undefined,
      includeESI: ss.include_esi ?? false,
      esiPercent: ss.esi_percent ? Number(ss.esi_percent) : undefined,
      allowedLeaveDays: ss.allowed_leave_days ?? undefined,
      createdAt: new Date(ss.created_at).toISOString(),
      updatedAt: new Date(ss.updated_at).toISOString(),
    }));
    
    // Update local state when server data changes
    setLocalStaffMembers(transformed);
    return transformed;
  }, [supabaseStaff]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = staffMembers.length;
    const active = staffMembers.filter(s => s.isActive).length;
    const inactive = total - active;
    const totalPayroll = staffMembers
      .filter(s => s.isActive)
      .reduce((sum, s) => sum + s.monthlySalary, 0);

    return { total, active, inactive, totalPayroll };
  }, [staffMembers]);

  // Filter and sort staff
  const filteredStaff = useMemo(() => {
    let filtered = staffMembers.filter(staff => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery) ||
        staff.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && staff.isActive) ||
        (statusFilter === "inactive" && !staff.isActive);

      return matchesSearch && matchesStatus;
    });

    // Sort
    if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "salary-high") {
      filtered.sort((a, b) => b.monthlySalary - a.monthlySalary);
    } else if (sortBy === "salary-low") {
      filtered.sort((a, b) => a.monthlySalary - b.monthlySalary);
    } else if (sortBy === "position") {
      filtered.sort((a, b) => a.position.localeCompare(b.position));
    } else {
      // recent first
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [staffMembers, searchQuery, statusFilter, sortBy]);

  const handleStaffAdded = async (newStaff: Staff) => {
    console.log('⚡ Staff member added, updating UI instantly...', newStaff);
    
    // INSTANT UI update (optimistic)
    setLocalStaffMembers(prevStaff => [newStaff, ...prevStaff]);
    setIsAddModalOpen(false);
    
    console.log('✅ UI updated instantly with new staff member');
    
    // Background sync with smart merge
    setTimeout(() => {
      refetch().then(() => {
        console.log('🔄 Background sync completed');
      });
    }, 500);
  };

  const handleStaffClick = (staff: Staff) => {
    navigate(`/staff/${staff.id}`);
  };

  const handleToggleStatus = async (staff: Staff, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await staffService.toggleStaffStatus(staff.id);
      // Refetch staff after status toggle
      await refetch();
      toast.success(`Staff marked as ${!staff.isActive ? "active" : "inactive"}`);
    } catch (error) {
      console.error("Error toggling staff status:", error);
      toast.error("Failed to update status");
    }
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-orange-600",
      "bg-teal-600",
      "bg-cyan-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage employees, attendance, and payroll
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Total Staff</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>

          <div className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Active Staff</div>
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>

          <div className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Inactive Staff</div>
              <UserX className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
          </div>

          <div className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">Monthly Payroll</div>
              <svg
                className="h-5 w-5 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(stats.totalPayroll)}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            type="text"
              placeholder="Search by name, position, or phone..."
              className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="position">Position</SelectItem>
              <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
              <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Staff List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading staff...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-lg">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || statusFilter !== "all" ? "No staff found" : "No staff members yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first staff member"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-card border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleStaffClick(staff)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full ${getAvatarColor(
                        staff.name
                      )} flex items-center justify-center text-white font-semibold flex-shrink-0`}
                    >
                      {getInitials(staff.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {staff.name}
                          </h3>
                      <p className="text-sm text-muted-foreground">{staff.position}</p>
                        </div>
                      </div>
                  <Badge
                    variant={staff.isActive ? "default" : "secondary"}
                    className={staff.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                          </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{staff.phone}</span>
                          </div>
                  {staff.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{staff.email}</span>
                        </div>
                      )}
                    </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground">Monthly Salary</div>
                    <div className="text-lg font-bold text-foreground">
                      {formatCurrency(staff.monthlySalary)}
                    </div>
                  </div>
                  <Button
                    variant={staff.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={(e) => handleToggleStatus(staff, e)}
                    className="rounded-full"
                  >
                    {staff.isActive ? "Mark Inactive" : "Mark Active"}
                      </Button>
                </div>

                {/* Added date */}
                <div className="text-xs text-muted-foreground mt-3">
                  Added {formatDate(staff.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onStaffAdded={handleStaffAdded}
      />
    </DashboardLayout>
  );
}
