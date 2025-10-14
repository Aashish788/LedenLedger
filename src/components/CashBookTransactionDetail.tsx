import { X, Receipt, Calendar, CreditCard, FileText, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface CashBookTransactionDetailProps {
  transaction: CashBookEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (transaction: CashBookEntry) => void;
  onDelete?: (transactionId: string) => void;
}

export function CashBookTransactionDetail({ 
  transaction, 
  isOpen, 
  onClose,
  onEdit,
  onDelete 
}: CashBookTransactionDetailProps) {
  if (!transaction) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction.id);
      onClose();
    }
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
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                transaction.type === "cash_in" 
                  ? "bg-green-600/20" 
                  : "bg-red-600/20"
              }`}>
                <Receipt className={`h-6 w-6 ${
                  transaction.type === "cash_in" 
                    ? "text-green-500" 
                    : "text-red-500"
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {transaction.type === "cash_in" ? "Cash In" : "Cash Out"}
                </h2>
                <p className="text-sm text-gray-400">{transaction.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleEdit}
                className="text-gray-400 hover:text-white"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="h-[calc(100vh-180px)] overflow-y-auto px-4">
          {/* Amount Section */}
          <div className="py-6 text-center border-b border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              {transaction.type === "cash_in" ? "Amount Received" : "Amount Paid"}
            </div>
            <div className={`text-4xl font-bold ${
              transaction.type === "cash_in" 
                ? "text-green-500" 
                : "text-red-500"
            }`}>
              ₹{parseFloat(transaction.amount).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="py-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Transaction Details</h3>
            
            {/* Date */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm font-medium text-white">{formatDate(transaction.date)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-sm font-medium text-white">{formatTime(transaction.createdAt)}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
              <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30">
                  {transaction.paymentMethod.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-white">{transaction.category}</p>
              </div>
            </div>

            {/* Reference Number */}
            {transaction.reference && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Reference Number</p>
                  <p className="text-sm font-medium text-white">{transaction.reference}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm font-medium text-white leading-relaxed">{transaction.description}</p>
                </div>
              </div>
            )}

            {/* Transaction ID */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-gray-400">{transaction.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[#1a1a1a] border-t border-gray-800 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11 border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              className="h-11 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleEdit}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Transaction
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
