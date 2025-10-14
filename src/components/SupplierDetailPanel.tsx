import { useState } from "react";
import { X, FileText, MessageSquare, Send, Calendar, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { PartyProfileModal } from "@/components/PartyProfileModal";

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

interface SupplierDetailPanelProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded?: (data: any) => void;
}

export function SupplierDetailPanel({ supplier, isOpen, onClose, onTransactionAdded }: SupplierDetailPanelProps) {
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"gave" | "got" | null>(null);
  const [isPartyProfileOpen, setIsPartyProfileOpen] = useState(false);

  if (!supplier) return null;

  const transactions = supplier.transactions || [];
  const balance = parseFloat(supplier.openingBalance || "0");
  const isCredit = supplier.balanceType === "credit";

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

  const handleDueDateSelect = (days: number) => {
    setSelectedDueDate(`${days} days`);
  };

  const handleOpenAddTransaction = (type: "gave" | "got") => {
    setTransactionType(type);
    setIsAddTransactionOpen(true);
  };

  const handleTransactionAddedInternal = (transactionData: any) => {
    onTransactionAdded?.(transactionData);
  };

  const calculateNetBalance = () => {
    let total = balance;
    transactions.forEach(t => {
      if (t.type === "gave") {
        total += t.amount;
      } else {
        total -= t.amount;
      }
    });
    return total;
  };

  const netBalance = calculateNetBalance();

  const handleWhatsAppReminder = () => {
    // Clean phone number (remove spaces, dashes, brackets, etc.)
    let cleanPhone = supplier.phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    // If number is 10 digits, add 91 prefix
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }
    
    // Generate message based on balance type
    let message = '';
    if (netBalance > 0 && isCredit) {
      // Supplier owes money
      message = `Hi ${supplier.name},

This is a payment reminder from our business.

Your pending amount: ₹${Math.abs(netBalance).toFixed(0)}

Please clear the dues at the earliest.

Thank you!`;
    } else if (netBalance > 0 && !isCredit) {
      // We owe supplier money
      message = `Hi ${supplier.name},

This is to inform you that we have a pending payment.

Amount: ₹${Math.abs(netBalance).toFixed(0)}

We will settle this soon.

Thank you for your patience!`;
    } else {
      // No pending balance
      message = `Hi ${supplier.name},

Thank you for your service. Your account is currently settled with no pending dues.

Best regards!`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp (works on both mobile and desktop)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Overlay - Only on Mobile */}
      <div
        className={`md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[520px] bg-[#1a1a1a] border-l border-gray-800 shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-gray-800 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${getAvatarColor(supplier.name)} flex items-center justify-center text-white font-bold text-lg`}>
                {getInitials(supplier.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{supplier.name}</h2>
                <p className="text-sm text-gray-400">{supplier.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <FileText className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsPartyProfileOpen(true)} className="text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          </div>
  
         {/* Scrollable Content */}
         <div className="h-[calc(100vh-180px)] overflow-y-auto px-4">
           {/* NET BALANCE Section */}
           <div className="py-4 text-right border-b border-gray-800">
             <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">NET BALANCE:</div>
             {netBalance > 0 ? (
               <div className={`text-2xl font-bold ${isCredit ? "text-red-500" : "text-green-500"}`}>
                 {isCredit ? "You'll Get:" : "You'll Give:"} ₹{Math.abs(netBalance).toFixed(0)}
               </div>
             ) : (
               <div className="text-2xl font-bold text-gray-500">₹0</div>
             )}
           </div>
          {/* Set Due Date Section */}
          <div className="py-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Set Due Date:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedDueDate === "7 days" ? "default" : "outline"}
                size="sm"
                className={`rounded-md h-9 px-4 text-sm ${
                  selectedDueDate === "7 days"
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-0"
                    : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
                onClick={() => handleDueDateSelect(7)}
              >
                7 days
              </Button>
              <Button
                variant={selectedDueDate === "14 days" ? "default" : "outline"}
                size="sm"
                className={`rounded-md h-9 px-4 text-sm ${
                  selectedDueDate === "14 days"
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-0"
                    : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
                onClick={() => handleDueDateSelect(14)}
              >
                14 days
              </Button>
              <Button
                variant={selectedDueDate === "30 days" ? "default" : "outline"}
                size="sm"
                className={`rounded-md h-9 px-4 text-sm ${
                  selectedDueDate === "30 days"
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-0"
                    : "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
                onClick={() => handleDueDateSelect(30)}
              >
                30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md h-9 px-4 text-sm bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Select Date
              </Button>
            </div>
          </div>

          {/* Send Reminder Section */}
          <div className="py-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-300">Send Reminder</span>
              <button className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-500">i</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={handleWhatsAppReminder}
                className="justify-start h-auto py-3 bg-transparent border border-gray-700 hover:bg-gray-800"
              >
                <div className="flex items-start gap-2 w-full">
                  <MessageSquare className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white text-sm">Whatsapp</span>
                    <span className="text-xs text-gray-500">from your number</span>
                  </div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3 bg-transparent border border-gray-700 hover:bg-gray-800"
              >
                <div className="flex items-start gap-2 w-full">
                  <Send className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white text-sm">SMS</span>
                    <span className="text-xs text-gray-500">from Our Number</span>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Transactions/Entries Section */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase text-gray-500 tracking-wider">ENTRIES</h3>
            </div>

            {/* Transaction Headers */}
            <div className="grid grid-cols-3 gap-4 mb-3 pb-2 border-b border-gray-800">
              <div className="col-span-1"></div>
              <div className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">YOU GAVE</div>
              <div className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">YOU GOT</div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.length === 0 && balance === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-800 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">No transactions yet</p>
                  <Button size="sm" className="rounded-md bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </div>
              ) : null}

              {/* Opening Balance - Only show if there are no transactions */}
              {balance > 0 && transactions.length === 0 && (
                <div className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800/50 bg-gray-900/30">
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-white flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">OPENING BALANCE</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(supplier.createdAt, "dd MMM yyyy")}
                    </div>
                  </div>
                  <div className="text-center">
                    {!isCredit ? (
                      <div className="text-base font-bold text-red-500">
                        ₹{balance.toFixed(0)}
                      </div>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>
                  <div className="text-center">
                    {isCredit ? (
                      <div className="text-base font-bold text-green-500">
                        ₹{balance.toFixed(0)}
                      </div>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Transactions */}
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-3 gap-4 items-center py-3 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-white">
                      {format(transaction.date, "dd MMM yyyy")} • {format(transaction.date, "h:mm a")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Balance: {transaction.balance < 0 ? '-' : ''}₹{Math.abs(transaction.balance).toFixed(0)}
                    </div>
                  </div>
                  <div className="text-center">
                    {transaction.type === "gave" ? (
                      <div className="text-base font-bold text-red-500">
                        ₹{transaction.amount.toFixed(0)}
                      </div>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>
                  <div className="text-center">
                    {transaction.type === "got" ? (
                      <div className="text-base font-bold text-green-500">
                        ₹{transaction.amount.toFixed(0)}
                      </div>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleOpenAddTransaction("gave")}
              className="h-12 rounded-lg bg-[#8B2E2E] hover:bg-[#7A2828] text-white font-medium"
            >
              You Gave ₹
            </Button>
            <Button 
              onClick={() => handleOpenAddTransaction("got")}
              className="h-12 rounded-lg bg-[#2E7D32] hover:bg-[#266629] text-white font-medium"
            >
              You Got ₹
            </Button>
          </div>
        </div>
      </div>

      <AddTransactionModal
        open={isAddTransactionOpen}
        onOpenChange={setIsAddTransactionOpen}
        transactionType={transactionType}
        customerName={supplier.name}
        onTransactionAdded={handleTransactionAddedInternal}
      />

      <PartyProfileModal
        open={isPartyProfileOpen}
        onOpenChange={setIsPartyProfileOpen}
        party={{
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          gstNumber: supplier.gstNumber,
          type: "supplier",
        }}
      />
    </>
  );
}
