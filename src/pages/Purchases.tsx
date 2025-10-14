import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Package, Search } from "lucide-react";

export default function Purchases() {
  const [purchases] = useState([]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Purchases</h1>
            <p className="text-sm text-muted-foreground">Manage purchase orders and inventory</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search purchases..."
            className="search-bar pl-11"
          />
        </div>

        {purchases.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No purchases recorded"
            description="Record your purchase transactions from suppliers. Keep track of inventory, costs, and supplier payments."
            actionLabel="Record Your First Purchase"
            onAction={() => console.log("Record purchase")}
          />
        ) : (
          <div>Purchase list will appear here</div>
        )}
      </div>
    </DashboardLayout>
  );
}
