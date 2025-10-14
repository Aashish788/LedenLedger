import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Search } from "lucide-react";

export default function Receipts() {
  const [receipts] = useState([]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Receipts</h1>
            <p className="text-sm text-muted-foreground">Manage payment receipts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Create Receipt
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search receipts..."
            className="search-bar pl-11"
          />
        </div>

        {receipts.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No receipts created"
            description="Generate receipts for customer payments. Maintain professional records and provide proof of payment."
            actionLabel="Create Your First Receipt"
            onAction={() => console.log("Create receipt")}
          />
        ) : (
          <div>Receipt list will appear here</div>
        )}
      </div>
    </DashboardLayout>
  );
}
