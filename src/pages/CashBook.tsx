import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Wallet, Calendar, Receipt, ChevronDown, Loader2 } from "lucide-react";
import { AddCashBookModal } from "@/components/AddCashBookModal";
import { Badge } from "@/components/ui/badge";
import { CashBookTransactionDetail } from "@/components/CashBookTransactionDetail";
import { useCashBook } from "@/hooks/useUserData";
import type { CashBookEntry as SupabaseCashBookEntry } from "@/services/api/userDataService";
import { toast } from "sonner";

interface CashBookEntry {
  id: string;
  type: "cash_in" | "cash_out";
  amount: string;
  category: string;
  description?: string;
  date: string;
  paymentMethod: string;
  reference?: string;
  createdAt: Date;
}

export default function CashBook() {
  // Fetch cash book entries from Supabase
  const { data: supabaseCashBook, isLoading, refetch } = useCashBook();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<"cash_in" | "cash_out">("cash_in");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashBookEntry | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CashBookEntry | null>(null);
  const [localEntries, setLocalEntries] = useState<CashBookEntry[]>([]);

  // Transform Supabase cash book entries to local format
  const entries = useMemo(() => {
    if (!supabaseCashBook) return localEntries;
    
    const transformed = supabaseCashBook.map((entry: SupabaseCashBookEntry): CashBookEntry => ({
      id: entry.id,
      type: entry.type === 'in' ? 'cash_in' : 'cash_out',
      amount: entry.amount.toString(),
      category: entry.note || 'General',
      description: entry.note || undefined,
      date: new Date(entry.timestamp).toISOString().split('T')[0],
      paymentMethod: entry.payment_mode === 'cash' ? 'Cash' : 'Online',
      reference: undefined,
      createdAt: new Date(entry.created_at),
    }));
    
    // Update local state when server data changes
    setLocalEntries(transformed);
    return transformed;
  }, [supabaseCashBook]);

  const handleEntryAdded = async (entryData: any) => {
    console.log('⚡ Cashbook entry added, updating UI instantly...', entryData);
    
    // Create new entry object from server data
    const newEntry: CashBookEntry = {
      id: entryData.id,
      type: entryData.type === 'in' || entryData.type === 'cash_in' ? 'cash_in' : 'cash_out',
      amount: entryData.amount?.toString() || '0',
      category: entryData.category || 'General',
      description: entryData.description,
      date: new Date(entryData.date || entryData.timestamp).toISOString().split('T')[0],
      paymentMethod: entryData.payment_method === 'cash' ? 'Cash' : 'Online',
      reference: entryData.reference_number,
      createdAt: new Date(entryData.created_at || Date.now()),
    };
    
    // INSTANT UI update (optimistic)
    setLocalEntries(prevEntries => [newEntry, ...prevEntries]);
    setIsAddModalOpen(false);
    
    console.log('✅ UI updated instantly with new entry');
    
    // Background sync with smart merge
    setTimeout(() => {
      refetch().then(() => {
        console.log('🔄 Background sync completed');
      });
    }, 500);
  };

  const handleEntryUpdated = async (updatedEntry: CashBookEntry & { id: string }) => {
    // Refetch cash book entries after update
    await refetch();
    setEditingTransaction(null);
    toast.success("Cash book entry updated successfully");
  };

  const handleTransactionClick = (entry: CashBookEntry) => {
    setSelectedTransaction(entry);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setTimeout(() => setSelectedTransaction(null), 300);
  };

  const handleEditTransaction = (transaction: CashBookEntry) => {
    // Close the detail panel first
    setIsDetailPanelOpen(false);
    
    // Set the transaction to edit
    setEditingTransaction(transaction);
    setEntryType(transaction.type);
    
    // Wait for panel close animation, then open edit modal
    setTimeout(() => {
      setSelectedTransaction(null);
      setIsAddModalOpen(true);
    }, 300);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    // Refetch cash book entries after deletion
    await refetch();
    setIsDetailPanelOpen(false);
    toast.success("Transaction deleted successfully");
  };

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      // Clear editing transaction when modal closes
      setEditingTransaction(null);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesPayment = paymentFilter === "All" || 
      entry.paymentMethod.toLowerCase() === paymentFilter.toLowerCase();
    const matchesDate = entry.date === selectedDate;
    return matchesPayment && matchesDate;
  });

  const calculateTotals = () => {
    const cashIn = entries
      .filter(e => e.type === "cash_in")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const cashOut = entries
      .filter(e => e.type === "cash_out")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { cashIn, cashOut, balance: cashIn - cashOut };
  };

  const calculateDailyTotals = () => {
    const dailyCashIn = filteredEntries
      .filter(e => e.type === "cash_in")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const dailyCashOut = filteredEntries
      .filter(e => e.type === "cash_out")
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { dailyCashIn, dailyCashOut };
  };

  const totals = calculateTotals();
  const dailyTotals = calculateDailyTotals();

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }).toUpperCase();
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      return "TODAY";
    }
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const groupEntriesByDate = () => {
    const groups: { [key: string]: CashBookEntry[] } = {};
    filteredEntries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = [];
      }
      groups[entry.date].push(entry);
    });
    return groups;
  };

  const groupedEntries = groupEntriesByDate();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-28 relative">
        <div className="bg-background border-b sticky top-0 z-10 px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Cashbook</h1>
        </div>

        <div className="px-4 py-3 bg-background border-b">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Total Balance</p>
              <p className={`text-2xl font-bold ${
                totals.balance >= 0 
                  ? "text-green-600 dark:text-green-500" 
                  : "text-red-600 dark:text-red-500"
              }`}>
                ₹{totals.balance.toLocaleString('en-IN')}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 border-primary text-primary hover:bg-primary/10 h-8 text-xs">
              <Receipt className="h-3.5 w-3.5" />
              View Report
            </Button>
          </div>
          <div className="flex items-center justify-between pt-2.5 border-t">
            <p className="text-xs text-muted-foreground">Todays Balance</p>
            <p className={`text-base font-semibold ${
              (dailyTotals.dailyCashIn - dailyTotals.dailyCashOut) >= 0 
                ? "text-green-600 dark:text-green-500" 
                : "text-red-600 dark:text-red-500"
            }`}>
              ₹{(dailyTotals.dailyCashIn - dailyTotals.dailyCashOut).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="px-4 py-3 bg-background border-b">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Date</label>
              <div className="relative">
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none" style={{colorScheme: 'light dark'}} />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1.5">Payment Mode</label>
              <div className="relative">
                <button onClick={() => setShowPaymentDropdown(!showPaymentDropdown)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-left flex items-center justify-between hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
                  <span className="text-foreground">{paymentFilter}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                {showPaymentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                    {["All", "Cash", "Online", "Cheque", "Card"].map((mode) => (
                      <button key={mode} onClick={() => { setPaymentFilter(mode); setShowPaymentDropdown(false); }} className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-foreground">{mode}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4 py-16 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <h3 className="text-lg font-medium mb-2">Loading cash book...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          entries.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No cash entries</h3>
              <p className="text-sm text-muted-foreground">Keep track of all your cash inflows and outflows.</p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground">No transactions for selected date and filters</p>
            </div>
          )
        ) : (
          <div className="bg-muted/30">
            <div className="px-4 py-2.5 bg-background border-b">
              <div className="grid grid-cols-[1fr_70px_70px] gap-3 text-xs font-semibold text-muted-foreground">
                <div>NAME</div>
                <div className="text-right">OUT</div>
                <div className="text-right">IN</div>
              </div>
            </div>
            {Object.entries(groupedEntries).map(([date, dateEntries]) => {
              const dayOut = dateEntries.filter(e => e.type === "cash_out").reduce((sum, e) => sum + parseFloat(e.amount), 0);
              const dayIn = dateEntries.filter(e => e.type === "cash_in").reduce((sum, e) => sum + parseFloat(e.amount), 0);
              return (
                <div key={date}>
                  <div className="px-4 py-2.5 bg-background border-b">
                    <div className="grid grid-cols-[1fr_70px_70px] gap-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-0.5">{formatDateLabel(date)}</p>
                        <p className="text-[10px] text-muted-foreground">{dateEntries.length} {dateEntries.length === 1 ? 'Entry' : 'Entries'}</p>
                      </div>
                                            <div className="text-right text-xs font-bold text-red-600 dark:text-red-500">₹{dayOut.toLocaleString('en-IN')}</div>
                      <div className="text-right text-xs font-bold text-green-600 dark:text-green-500">₹{dayIn.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  {dateEntries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className={`px-4 py-3 bg-background ${index !== dateEntries.length - 1 ? 'border-b' : ''} hover:bg-accent/50 transition-colors cursor-pointer`}
                      onClick={() => handleTransactionClick(entry)}
                    >
                      <div className="grid grid-cols-[1fr_70px_70px] gap-3 items-start">
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${entry.type === "cash_in" ? "bg-green-100 dark:bg-green-950/30" : "bg-yellow-100 dark:bg-yellow-950/30"}`}>
                            <Receipt className={`h-4 w-4 ${entry.type === "cash_in" ? "text-green-600 dark:text-green-500" : "text-yellow-600 dark:text-yellow-500"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[10px] text-muted-foreground">{formatTime(entry.createdAt)}</p>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-none">{entry.paymentMethod.toUpperCase()}</Badge>
                            </div>
                            {entry.description && (
                              <p className="text-xs text-foreground">Description: <span className="font-normal">{entry.description}</span></p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.type === "cash_out" && (
                            <p className="text-sm font-semibold text-red-600 dark:text-red-500">₹{parseFloat(entry.amount).toLocaleString('en-IN')}</p>
                          )}
                          {entry.type === "cash_in" && (
                            <p className="text-sm text-muted-foreground">-</p>
                          )}
                        </div>
                        <div className="text-right">
                          {entry.type === "cash_in" && (
                            <p className="text-sm font-semibold text-green-600 dark:text-green-500">₹{parseFloat(entry.amount).toLocaleString('en-IN')}</p>
                          )}
                          {entry.type === "cash_out" && (
                            <p className="text-sm text-muted-foreground">-</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Sticky bottom buttons - no border, more spacing */}
        <div className="sticky bottom-8 left-0 right-0 bg-background p-3 z-20 mt-8">
          <div className="grid grid-cols-2 gap-2.5">
            <Button 
              size="lg" 
              className="h-12 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-500 dark:border-red-900 font-semibold text-sm rounded-xl shadow-none" 
              onClick={() => { setEntryType("cash_out"); setIsAddModalOpen(true); }}
            >
              OUT
            </Button>
            <Button 
              size="lg" 
              className="h-12 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 dark:bg-green-950/30 dark:hover:bg-green-950/50 dark:text-green-500 dark:border-green-900 font-semibold text-sm rounded-xl shadow-none" 
              onClick={() => { setEntryType("cash_in"); setIsAddModalOpen(true); }}
            >
              IN
            </Button>
          </div>
        </div>
      </div>

      <AddCashBookModal 
        open={isAddModalOpen} 
        onOpenChange={handleModalClose} 
        onEntryAdded={handleEntryAdded} 
        onEntryUpdated={handleEntryUpdated}
        defaultType={entryType}
        editData={editingTransaction}
      />
      
      <CashBookTransactionDetail
        transaction={selectedTransaction}
        isOpen={isDetailPanelOpen}
        onClose={handleCloseDetailPanel}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />
    </DashboardLayout>
  );
}
