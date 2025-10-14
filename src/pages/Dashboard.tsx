import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Sparkles, TrendingUp, FileText, Users, Building2 } from "lucide-react";

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Good morning, User</h1>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="search-bar pl-11"
          />
        </div>

        {/* Actions Section */}
        <div className="space-y-4">
          <h2 className="section-label">Actions</h2>
          <div className="action-card">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">Ask AI to analyze business data</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="section-label">Recent Activity</h2>
          <div className="grid gap-3">
            <div className="action-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Total sales overview</span>
              </div>
            </div>
            <div className="action-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Pending invoices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="section-label">Quick Actions</h2>
          <div className="grid gap-3">
            <div className="action-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Search customers and suppliers</span>
              </div>
            </div>
            <div className="action-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Add new customer</span>
              </div>
            </div>
            <div className="action-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-foreground">Manage suppliers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted border border-border">↑</kbd>
            <kbd className="px-2 py-1 rounded bg-muted border border-border">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted border border-border">↵</kbd>
            <span>to select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted border border-border">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
