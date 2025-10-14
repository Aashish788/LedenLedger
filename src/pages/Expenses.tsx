import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Search } from "lucide-react";

export default function Expenses() {
  const [expenses] = useState([]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Expenses</h1>
            <p className="text-sm text-muted-foreground">Track business expenses</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search expenses..."
            className="search-bar pl-11"
          />
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No expenses recorded"
            description="Keep track of all business expenses. Categorize costs, attach receipts, and maintain accurate financial records."
            actionLabel="Add Your First Expense"
            onAction={() => console.log("Add expense")}
          />
        ) : (
          <div>Expense list will appear here</div>
        )}
      </div>
    </DashboardLayout>
  );
}
