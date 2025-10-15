/**
 * Example: Customers Page with Real-Time Sync
 * 
 * This is a complete example showing how to implement
 * real-time bidirectional sync in a React component.
 * 
 * Replace your existing Customers.tsx with this implementation.
 */

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, FileText, Loader2 } from "lucide-react";
import { CustomerDetailPanel } from "@/components/CustomerDetailPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";

// ✨ NEW: Import real-time hooks
import { useRealtimeData } from "@/hooks/useRealtimeSync";
import { customersService, type Customer } from "@/services/api/customersService";

export default function CustomersWithRealtime() {
  const navigate = useNavigate();
  
  // ✨ NEW: Use real-time hook for automatic sync
  const {
    data: customers,
    setData: setCustomers,
    isLoading,
    create: createCustomer,
    update: updateCustomer,
    remove: deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRealtimeData<Customer>('customers', {
    filter: `deleted_at=is.null`,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ✨ Initial data fetch
  useEffect(() => {
    const loadCustomers = async () => {
      const { data } = await customersService.fetchCustomers();
      if (data) {
        setCustomers(data);
      }
    };
    
    loadCustomers();
  }, []);

  // ✨ Handle customer creation
  const handleCustomerAdded = async (customerData: any) => {
    try {
      const newCustomer = await createCustomer({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || null,
        address: customerData.address || null,
        gst_number: customerData.gstNumber || null,
        amount: parseFloat(customerData.openingBalance || "0"),
        notes: customerData.notes || null,
      });

      if (newCustomer) {
        toast.success("Customer added!", {
          description: "The customer will sync automatically across all devices.",
        });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to add customer", {
        description: "Please try again or check your connection.",
      });
    }
  };

  // ✨ Handle customer update
  const handleCustomerUpdate = async (id: string, updates: any) => {
    try {
      await updateCustomer(id, updates);
      toast.success("Customer updated!");
    } catch (error) {
      toast.error("Failed to update customer");
    }
  };

  // ✨ Handle customer deletion
  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id);
      toast.success("Customer deleted!");
      
      // Close panel if deleted customer was selected
      if (selectedCustomer?.id === id) {
        setIsPanelOpen(false);
        setSelectedCustomer(null);
      }
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => {
      if (window.innerWidth < 768) {
        setSelectedCustomer(null);
      }
    }, 300);
  };

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone.includes(searchQuery)
      );
    }

    // Balance filter
    if (filterBy !== "all") {
      filtered = filtered.filter((customer) => {
        if (filterBy === "to-get") return customer.amount > 0;
        if (filterBy === "to-pay") return customer.amount < 0;
        return true;
      });
    }

    // Sort
    if (sortBy === "recent") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "amount-high") {
      filtered = [...filtered].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }

    return filtered;
  }, [customers, searchQuery, filterBy, sortBy]);

  // Calculate totals
  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        if (customer.amount > 0) {
          acc.toGet += customer.amount;
        } else {
          acc.toPay += Math.abs(customer.amount);
        }
        return acc;
      },
      { toGet: 0, toPay: 0 }
    );
  }, [customers]);

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-6">
        {/* ✨ Sync Status Indicator */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">
              Manage your customer relationships and transactions
            </p>
          </div>
          <SyncStatusIndicator />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium">Total Customers</p>
            </div>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                customers.length
              )}
            </div>
          </div>
          <div className="rounded-lg border bg-green-50 p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-green-900">To Get</p>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ₹{totals.toGet.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-lg border bg-red-50 p-6">
            <div className="flex flex-row items-center justify-between space-y-0">
              <p className="text-sm font-medium text-red-900">To Pay</p>
            </div>
            <div className="text-2xl font-bold text-red-600">
              ₹{totals.toPay.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-initial">
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
            <Button variant="outline" onClick={() => navigate("/bulk-import-customers")}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-8 pr-4 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={filterBy} onValueChange={setFilterBy} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="to-get">To Get</TabsTrigger>
              <TabsTrigger value="to-pay">To Pay</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="amount-high">Amount (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customers List */}
        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search" : "Get started by adding your first customer"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleCustomerClick(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{customer.name}</h3>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${customer.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {customer.amount >= 0 ? '↓' : '↑'} ₹{Math.abs(customer.amount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer.amount >= 0 ? 'You\'ll get' : 'You\'ll give'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal - Add your existing modal component here */}
      {/* <AddCustomerModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCustomerAdded={handleCustomerAdded}
      /> */}

      {/* Customer Detail Panel */}
      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          open={isPanelOpen}
          onClose={handleClosePanel}
          onDelete={handleDeleteCustomer}
          onUpdate={handleCustomerUpdate}
        />
      )}
    </DashboardLayout>
  );
}
