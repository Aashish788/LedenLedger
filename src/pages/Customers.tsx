import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, FileText, Loader2 } from "lucide-react";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import { CustomerDetailPanel } from "@/components/CustomerDetailPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "@/hooks/useUserData";
import type { Customer as SupabaseCustomer } from "@/services/api/userDataService";

interface Transaction {
  id: string;
  date: Date;
  type: "gave" | "got";
  amount: number;
  balance: number;
  note?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  openingBalance?: string;
  balanceType: "credit" | "debit";
  createdAt: Date;
  transactions?: Transaction[];
}

export default function Customers() {
  const navigate = useNavigate();
  
  // Fetch customers from Supabase
  const { data: supabaseCustomers, isLoading, refetch } = useCustomers();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Transform Supabase customers to local format
  const customers = useMemo(() => {
    if (!supabaseCustomers) return [];
    
    return supabaseCustomers.map((sc: SupabaseCustomer): Customer => {
      // Transform Supabase transactions to local format
      const transformedTransactions = (sc.transactions || []).map(t => ({
        id: t.id,
        date: new Date(t.date),
        type: t.type === 'gave' ? 'gave' as const : 'got' as const,
        amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount || '0'),
        balance: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount || '0'),
        note: t.description || '',
      }));

      return {
          id: sc.id,
        name: sc.name,
        phone: sc.phone,
        email: sc.email || undefined,
        address: sc.address || undefined,
        gstNumber: sc.gst_number || undefined,
        openingBalance: sc.amount ? Math.abs(sc.amount).toString() : "0",
        balanceType: sc.amount >= 0 ? "credit" : "debit",
        createdAt: new Date(sc.created_at),
        transactions: transformedTransactions, // ✅ NOW INCLUDING TRANSACTIONS!
      };
    });
  }, [supabaseCustomers]);

  const handleCustomerAdded = async (customerData: any) => {
    // Refetch customers after adding a new one
    await refetch();
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    // Refetch customers after deletion
    await refetch();
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // On desktop, keep the panel ready for quick switching
    // On mobile, clear after animation
    setTimeout(() => {
      if (window.innerWidth < 768) {
        setSelectedCustomer(null);
      }
    }, 300);
  };

  const handleTransactionAdded = async (transactionData: any) => {
    if (!selectedCustomer) return;

    console.log('⚡ Transaction added, updating UI INSTANTLY...', transactionData);
    
    // Create the new transaction object
    const newTransaction: Transaction = {
      id: transactionData.id,
      date: transactionData.date,
      type: transactionData.type === 'received' ? 'got' : 'gave',
      amount: parseFloat(transactionData.amount || transactionData.amount),
      balance: parseFloat(selectedCustomer.openingBalance || "0"),
      note: transactionData.description,
    };

    // IMMEDIATELY update UI (optimistic update)
    setSelectedCustomer(prevCustomer => {
      if (!prevCustomer) return null;
      return {
        ...prevCustomer,
        transactions: [newTransaction, ...(prevCustomer.transactions || [])],
      };
    });
    
    console.log('✅ UI updated instantly');
    
    // Background sync with SMART MERGE (don't replace, merge!)
    setTimeout(() => {
      refetch().then(() => {
        if (supabaseCustomers) {
          const serverCustomer = supabaseCustomers.find((c: any) => c.id === selectedCustomer.id);
          if (serverCustomer) {
            const serverTransactions = serverCustomer.transactions?.map((t: any) => ({
              id: t.id,
              date: t.date,
              type: t.type === 'received' ? 'got' : 'gave',
              amount: parseFloat(t.amount),
              balance: parseFloat(t.amount),
              note: t.description,
            })) || [];
            
            // SMART MERGE: Keep optimistic transaction if not yet on server
            setSelectedCustomer(prev => {
              if (!prev) return null;
              
              const optimisticIds = prev.transactions?.map(t => t.id) || [];
              const serverIds = serverTransactions.map(t => t.id);
              
              // Keep optimistic transactions not yet confirmed by server
              const optimisticOnly = prev.transactions?.filter(t => !serverIds.includes(t.id)) || [];
              
              console.log('🔄 Merge: Optimistic only:', optimisticOnly.length, 'Server:', serverTransactions.length);
              
              return {
                id: serverCustomer.id,
                name: serverCustomer.name,
                phone: serverCustomer.phone,
                email: serverCustomer.email,
                address: serverCustomer.address,
                gstNumber: serverCustomer.gst_number,
                openingBalance: serverCustomer.amount?.toString() || "0",
                balanceType: parseFloat(serverCustomer.amount || 0) >= 0 ? "credit" : "debit",
                createdAt: serverCustomer.created_at,
                // Merge: optimistic transactions + server transactions (deduplicated)
                transactions: [...optimisticOnly, ...serverTransactions],
              };
            });
          }
        }
      });
    }, 500); // 500ms delay for DB commit
  };

  // Calculate totals
  const calculateTotals = () => {
    let youllGive = 0;
    let youllGet = 0;

    customers.forEach(customer => {
      const balance = parseFloat(customer.openingBalance || "0");
      if (balance > 0) {
        if (customer.balanceType === "debit") {
          youllGive += balance;
        } else {
          youllGet += balance;
        }
      }
    });

    return { youllGive, youllGet };
  };

  const totals = calculateTotals();

  // Filter and sort customers
  let filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  if (filterBy === "youllget") {
    filteredCustomers = filteredCustomers.filter(c => c.balanceType === "credit" && parseFloat(c.openingBalance || "0") > 0);
  } else if (filterBy === "youllgive") {
    filteredCustomers = filteredCustomers.filter(c => c.balanceType === "debit" && parseFloat(c.openingBalance || "0") > 0);
  }

  if (sortBy === "amount-high") {
    filteredCustomers.sort((a, b) => parseFloat(b.openingBalance || "0") - parseFloat(a.openingBalance || "0"));
  } else if (sortBy === "amount-low") {
    filteredCustomers.sort((a, b) => parseFloat(a.openingBalance || "0") - parseFloat(b.openingBalance || "0"));
  } else if (sortBy === "name") {
    filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filteredCustomers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const getTimeAgo = (date: Date) => {
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

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-green-600",
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-orange-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <DashboardLayout>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 ease-in-out ${
        isPanelOpen ? "md:mr-[520px] md:max-w-3xl" : ""
      }`}>
        {/* Tabs with View Report Button */}
        <div className="flex items-center justify-between border-b border-border overflow-x-auto">
          <Tabs defaultValue="customers" className="flex-1">
            <TabsList className="justify-start border-0 rounded-none h-10 sm:h-12 bg-transparent p-0">
              <TabsTrigger 
                value="customers" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-6 text-sm sm:text-base"
              >
                Customers <span className="ml-1 sm:ml-2 text-primary font-semibold">{customers.length}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers"
                onClick={() => navigate('/suppliers')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-6 text-sm sm:text-base"
              >
                Suppliers <span className="ml-1 sm:ml-2 text-muted-foreground">0</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            className="rounded-full mr-4" 
            size="sm"
            onClick={() => navigate('/reports')}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="bg-card border rounded-lg p-4 flex items-center justify-between">
          <div>
              <div className="text-sm text-muted-foreground mb-1">You'll Give:</div>
              <div className="text-2xl font-bold flex items-center gap-2">
                ₹{totals.youllGive.toFixed(1)}
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">You'll Get:</div>
            <div className="text-2xl font-bold flex items-center gap-2 text-green-600">
              ₹{totals.youllGet.toFixed(1)}
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Name or Phone Number"
              className="w-full h-11 pl-10 pr-4 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="h-11">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <SelectValue placeholder="Filter By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="youllget">You'll Get</SelectItem>
              <SelectItem value="youllgive">You'll Give</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
              <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-2 px-4 py-3 border-b bg-muted/30 text-sm font-medium text-muted-foreground">
          <div>NAME</div>
          <div className="text-right">AMOUNT</div>
        </div>

        {/* Customer List */}
        <div className="bg-card border-x border-b">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading customers...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your data
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start by adding your first customer
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          ) : (
            filteredCustomers.map((customer, index) => {
              const balance = parseFloat(customer.openingBalance || "0");
              const isDebit = customer.balanceType === "debit";
              
              return (
                <div
                  key={customer.id}
                  className={`grid grid-cols-2 px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    index !== filteredCustomers.length - 1 ? "border-b" : ""
                  } ${selectedCustomer?.id === customer.id ? "bg-muted/50" : ""}`}
                  onClick={() => handleCustomerClick(customer)}
                >
                  {/* Left side - Name and details */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(customer.name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {customer.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeAgo(customer.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Amount */}
                  <div className="flex flex-col items-end justify-center">
                    {balance > 0 ? (
                      <>
                        <div className={`text-lg font-bold ${
                          isDebit ? "text-foreground" : "text-red-600"
                        }`}>
                          ₹{balance.toFixed(1)}
                        </div>
                        <div className={`text-xs font-medium ${
                          isDebit ? "text-green-600" : "text-red-600"
                        }`}>
                          {isDebit ? "YOU'LL GIVE" : "YOU'LL GET"}
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-medium text-muted-foreground">
                        ₹0.0
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
          <Button variant="outline" className="h-12 rounded-lg" onClick={() => navigate('/customers/bulk-import')}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Customers
          </Button>
          <Button className="h-12 rounded-lg bg-primary hover:bg-primary/90" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      <AddCustomerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCustomerAdded={handleCustomerAdded}
      />

      <CustomerDetailPanel
        key={`${selectedCustomer?.id}-${selectedCustomer?.transactions?.length || 0}`}
        customer={selectedCustomer}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onTransactionAdded={handleTransactionAdded}
      />
    </DashboardLayout>
  );
}
