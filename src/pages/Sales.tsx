import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Search } from "lucide-react";

export default function Sales() {
  const [sales] = useState([]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Sales</h1>
            <p className="text-sm text-muted-foreground">Track all sales transactions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Record Sale
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sales..."
            className="search-bar pl-11"
          />
        </div>

        {sales.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No sales recorded"
            description="Start recording your sales transactions. Track revenue, manage inventory, and analyze your business performance."
            actionLabel="Record Your First Sale"
            onAction={() => console.log("Record sale")}
          />
        ) : (
          <div>Sales list will appear here</div>
        )}
      </div>
    </DashboardLayout>
  );
}
