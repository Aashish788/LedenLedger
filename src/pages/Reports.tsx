import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, ArrowLeftRight, Calendar } from "lucide-react";

interface Transaction {
  id: string;
  date: Date;
  customerName: string;
  details: string;
  youGave: number;
  youGot: number;
  type: "customer" | "supplier";
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"customers" | "suppliers">("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("thisYear");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  // Sample data - this would come from your actual data source
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      date: new Date("2025-09-27"),
      customerName: "Abhay Abes",
      details: "-",
      youGave: 100,
      youGot: 0,
      type: "customer",
    },
    {
      id: "2",
      date: new Date("2025-09-27"),
      customerName: "Aditya 2",
      details: "-",
      youGave: 500,
      youGot: 0,
      type: "customer",
    },
    {
      id: "3",
      date: new Date("2025-08-05"),
      customerName: "Abc",
      details: "-",
      youGave: 0,
      youGot: 1000,
      type: "customer",
    },
    {
      id: "4",
      date: new Date("2025-07-15"),
      customerName: "Def Company",
      details: "-",
      youGave: 100,
      youGot: 0,
      type: "customer",
    },
  ]);

  // Filter transactions based on active tab and search
  const filteredTransactions = transactions.filter((t) => {
    const matchesTab = t.type === activeTab.slice(0, -1); // Remove 's' from customers/suppliers
    const matchesSearch = t.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Calculate totals
  const totalYouGave = filteredTransactions.reduce((sum, t) => sum + t.youGave, 0);
  const totalYouGot = filteredTransactions.reduce((sum, t) => sum + t.youGot, 0);
  const netBalance = totalYouGot - totalYouGave;

  // Count by type
  const customerCount = transactions.filter(t => t.type === "customer").length;
  const supplierCount = transactions.filter(t => t.type === "supplier").length;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const handleDownloadPDF = () => {
    alert("PDF download functionality will be implemented");
  };

  const handleDownloadExcel = () => {
    alert("Excel download functionality will be implemented");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Transactions Reports</h1>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="border-border hover:bg-accent"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadExcel}
                className="border-border hover:bg-accent"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("customers")}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === "customers"
                  ? "text-blue-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Customers
              <span className="ml-2 text-sm bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full">{customerCount}</span>
              {activeTab === "customers" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === "suppliers"
                  ? "text-blue-600"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Suppliers
              <span className="ml-2 text-sm bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded-full">{supplierCount}</span>
              {activeTab === "suppliers" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Customer Name</label>
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">Start</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background border-border pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block font-medium">End</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background border-border pl-10"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6">
            <p className="text-muted-foreground text-sm mb-3 font-medium">
              Total {filteredTransactions.length} entries
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-red-500/10 border-red-500/30 p-6 hover:bg-red-500/15 transition-colors">
                <div className="text-3xl font-bold text-foreground mb-1">
                  ₹{totalYouGave.toLocaleString()}
                </div>
                <div className="text-red-500 font-semibold">You Gave</div>
              </Card>
              <Card className="bg-green-500/10 border-green-500/30 p-6 hover:bg-green-500/15 transition-colors">
                <div className="text-3xl font-bold text-foreground mb-1">
                  ₹{totalYouGot.toLocaleString()}
                </div>
                <div className="text-green-500 font-semibold">You Got</div>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/30 p-6 hover:bg-blue-500/15 transition-colors">
                <div className="text-3xl font-bold text-foreground mb-1">
                  ₹{Math.abs(netBalance).toLocaleString()}
                </div>
                <div className="text-blue-500 font-semibold">Net Balance</div>
              </Card>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    DETAILS
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    YOU GAVE
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    YOU GOT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-foreground">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-4 px-6 text-foreground font-medium">
                        {transaction.customerName}
                      </td>
                      <td className="py-4 px-6 text-muted-foreground">{transaction.details}</td>
                      <td className="py-4 px-6 text-right">
                        {transaction.youGave > 0 ? (
                          <span className="text-red-500 font-semibold">₹{transaction.youGave.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {transaction.youGot > 0 ? (
                          <span className="text-green-500 font-semibold">₹{transaction.youGot.toLocaleString()}</span>
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

