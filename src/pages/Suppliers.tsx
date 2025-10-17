import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Upload, FileText, Loader2 } from "lucide-react";
import { AddSupplierModal } from "@/components/AddSupplierModal";
import { SupplierDetailPanel } from "@/components/SupplierDetailPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useUserData";
import type { Supplier as SupabaseSupplier } from "@/services/api/userDataService";

interface Transaction {
  id: string;
  date: Date;
  type: "gave" | "got";
  amount: number;
  balance: number;
  note?: string;
}

interface Supplier {
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

export default function Suppliers() {
  const navigate = useNavigate();
  
  // Fetch suppliers from Supabase
  const { data: supabaseSuppliers, isLoading, refetch } = useSuppliers();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Transform Supabase suppliers to local format
  const suppliers = useMemo(() => {
    if (!supabaseSuppliers) return [];
    
    return supabaseSuppliers.map((ss: SupabaseSupplier): Supplier => {
      // Transform Supabase transactions to local format
      const transformedTransactions = (ss.transactions || []).map(t => ({
        id: t.id,
        date: new Date(t.date),
        type: t.type === 'gave' ? 'gave' as const : 'got' as const,
        amount: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount || '0'),
        balance: typeof t.amount === 'number' ? t.amount : parseFloat(t.amount || '0'),
        note: t.description || undefined,
      }));

      // Database 'amount' field already contains CURRENT BALANCE
      const currentBalance = ss.amount || 0;

      return {
        id: ss.id,
        name: ss.name,
        phone: ss.phone,
        email: ss.email || undefined,
        address: ss.address || undefined,
        gstNumber: ss.gst_number || undefined,
        openingBalance: Math.abs(currentBalance).toString(),
        balanceType: currentBalance >= 0 ? "credit" : "debit",
        createdAt: new Date(ss.created_at),
        transactions: transformedTransactions,
      };
    });
  }, [supabaseSuppliers]);

  const handleSupplierAdded = async (supplierData: any) => {
    // Refetch suppliers after adding a new one
    await refetch();
    setIsAddModalOpen(false);
  };

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // On desktop, keep the panel ready for quick switching
    // On mobile, clear after animation
    setTimeout(() => {
      if (window.innerWidth < 768) {
        setSelectedSupplier(null);
      }
    }, 300);
  };

  const handleTransactionAdded = async (transactionData: any) => {
    if (!selectedSupplier) return;

    console.log('⚡ Transaction added, updating UI INSTANTLY...', transactionData);
    
    // Create the new transaction object
    const newTransaction: Transaction = {
      id: transactionData.id,
      date: transactionData.date,
      type: transactionData.type === 'received' ? 'got' : 'gave',
      amount: parseFloat(transactionData.amount || transactionData.amount),
      balance: parseFloat(selectedSupplier.openingBalance || "0"),
      note: transactionData.description,
    };

    // IMMEDIATELY update UI (optimistic update)
    setSelectedSupplier(prevSupplier => {
      if (!prevSupplier) return null;
      return {
        ...prevSupplier,
        transactions: [newTransaction, ...(prevSupplier.transactions || [])],
      };
    });
    
    console.log('✅ UI updated instantly');
    
    // Background sync with SMART MERGE (don't replace, merge!)
    setTimeout(() => {
      refetch().then(() => {
        if (supabaseSuppliers) {
          const serverSupplier = supabaseSuppliers.find((s: any) => s.id === selectedSupplier.id);
          if (serverSupplier) {
            const serverTransactions = serverSupplier.transactions?.map((t: any) => ({
              id: t.id,
              date: t.date,
              type: t.type === 'received' ? 'got' : 'gave',
              amount: parseFloat(t.amount),
              balance: parseFloat(t.amount),
              note: t.description,
            })) || [];
            
            // SMART MERGE: Keep optimistic transaction if not yet on server
            setSelectedSupplier(prev => {
              if (!prev) return null;
              
              const optimisticIds = prev.transactions?.map(t => t.id) || [];
              const serverIds = serverTransactions.map(t => t.id);
              
              // Keep optimistic transactions not yet confirmed by server
              const optimisticOnly = prev.transactions?.filter(t => !serverIds.includes(t.id)) || [];
              
              console.log('🔄 Merge: Optimistic only:', optimisticOnly.length, 'Server:', serverTransactions.length);
              
              return {
                id: serverSupplier.id,
                name: serverSupplier.name,
                phone: serverSupplier.phone,
                email: serverSupplier.email,
                address: serverSupplier.address,
                gstNumber: serverSupplier.gst_number,
                openingBalance: serverSupplier.amount?.toString() || "0",
                balanceType: parseFloat(serverSupplier.amount || 0) >= 0 ? "credit" : "debit",
                createdAt: serverSupplier.created_at,
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

    suppliers.forEach(supplier => {
      const balance = parseFloat(supplier.openingBalance || "0");
      if (balance > 0) {
        // balanceType "credit" = positive balance = you'll GET (they owe you)
        // balanceType "debit" = negative balance = you'll GIVE (you owe them)
        if (supplier.balanceType === "credit") {
          youllGet += balance;
        } else {
          youllGive += balance;
        }
      }
    });

    return { youllGive, youllGet };
  };

  const totals = calculateTotals();

  // Filter and sort suppliers
  let filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery)
  );

  if (filterBy === "youllget") {
    filteredSuppliers = filteredSuppliers.filter(s => s.balanceType === "credit" && parseFloat(s.openingBalance || "0") > 0);
  } else if (filterBy === "youllgive") {
    filteredSuppliers = filteredSuppliers.filter(s => s.balanceType === "debit" && parseFloat(s.openingBalance || "0") > 0);
  }

  if (sortBy === "amount-high") {
    filteredSuppliers.sort((a, b) => parseFloat(b.openingBalance || "0") - parseFloat(a.openingBalance || "0"));
  } else if (sortBy === "amount-low") {
    filteredSuppliers.sort((a, b) => parseFloat(a.openingBalance || "0") - parseFloat(b.openingBalance || "0"));
  } else if (sortBy === "name") {
    filteredSuppliers.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    filteredSuppliers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
      "bg-orange-600",
      "bg-teal-600",
      "bg-cyan-600",
      "bg-amber-600",
      "bg-rose-600",
      "bg-violet-600",
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
          <Tabs defaultValue="suppliers" className="flex-1">
            <TabsList className="justify-start border-0 rounded-none h-10 sm:h-12 bg-transparent p-0">
              <TabsTrigger 
                value="customers"
                onClick={() => navigate('/customers')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-6 text-sm sm:text-base"
              >
                Customers <span className="ml-1 sm:ml-2 text-muted-foreground">0</span>
              </TabsTrigger>
              <TabsTrigger 
                value="suppliers" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 sm:px-6 text-sm sm:text-base"
              >
                Suppliers <span className="ml-1 sm:ml-2 text-primary font-semibold">{suppliers.length}</span>
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
              <SelectItem value="all">All Suppliers</SelectItem>
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

        {/* Supplier List */}
        <div className="bg-card border-x border-b">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Loading suppliers...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your data
              </p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No suppliers yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Start by adding your first supplier
              </p>
              <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          ) : (
            filteredSuppliers.map((supplier, index) => {
              const balance = parseFloat(supplier.openingBalance || "0");
              const isDebit = supplier.balanceType === "debit";
              
              return (
                <div
                  key={supplier.id}
                  className={`grid grid-cols-2 px-4 py-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    index !== filteredSuppliers.length - 1 ? "border-b" : ""
                  } ${selectedSupplier?.id === supplier.id ? "bg-muted/50" : ""}`}
                  onClick={() => handleSupplierClick(supplier)}
                >
                  {/* Left side - Name and details */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(supplier.name)} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                      {getInitials(supplier.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {supplier.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeAgo(supplier.createdAt)}
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
          <Button variant="outline" className="h-12 rounded-lg" onClick={() => {}}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload Suppliers
          </Button>
          <Button className="h-12 rounded-lg bg-primary hover:bg-primary/90" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <AddSupplierModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSupplierAdded={handleSupplierAdded}
      />

      <SupplierDetailPanel
        key={`${selectedSupplier?.id}-${selectedSupplier?.transactions?.length || 0}`}
        supplier={selectedSupplier}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        onTransactionAdded={handleTransactionAdded}
      />
    </DashboardLayout>
  );
}
