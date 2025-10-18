import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { validateEnvironment } from "@/lib/security";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Lazy load components for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Customers = lazy(() => import("./pages/Customers"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Invoices = lazy(() => import("./pages/Invoices"));
const CashBook = lazy(() => import("./pages/CashBook"));
const StaffPage = lazy(() => import("./pages/Staff"));
const StaffDetail = lazy(() => import("./pages/StaffDetail"));
const Sales = lazy(() => import("./pages/Sales"));
const Purchases = lazy(() => import("./pages/Purchases"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Receipts = lazy(() => import("./pages/Receipts"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const BulkImportCustomers = lazy(() => import("./pages/BulkImportCustomers"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure query client with security settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if ((error as any)?.status === 401 || (error as any)?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => {
  // Validate environment on app start
  if (!validateEnvironment()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h1 className="text-xl font-semibold text-destructive mb-2">Configuration Error</h1>
          <p className="text-muted-foreground">
            Application is not properly configured. Please check environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BusinessProvider>
            <CurrencyProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public routes (accessible without authentication) */}
                      <Route 
                        path="/" 
                        element={
                          <PublicOnlyRoute>
                            <Landing />
                          </PublicOnlyRoute>
                        } 
                      />
                      <Route 
                        path="/login" 
                        element={
                          <PublicOnlyRoute>
                            <Login />
                          </PublicOnlyRoute>
                        } 
                      />

                      {/* Protected routes (require authentication) */}
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/customers" 
                        element={
                          <ProtectedRoute>
                            <Customers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/customers/bulk-import" 
                        element={
                          <ProtectedRoute>
                            <BulkImportCustomers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/suppliers" 
                        element={
                          <ProtectedRoute>
                            <Suppliers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/invoices" 
                        element={
                          <ProtectedRoute>
                            <Invoices />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/cashbook" 
                        element={
                          <ProtectedRoute>
                            <CashBook />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff" 
                        element={
                          <ProtectedRoute>
                            <StaffPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/staff/:id" 
                        element={
                          <ProtectedRoute>
                            <StaffDetail />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/sales" 
                        element={
                          <ProtectedRoute>
                            <Sales />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/purchases" 
                        element={
                          <ProtectedRoute>
                            <Purchases />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/expenses" 
                        element={
                          <ProtectedRoute>
                            <Expenses />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/receipts" 
                        element={
                          <ProtectedRoute>
                            <Receipts />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/reports" 
                        element={
                          <ProtectedRoute>
                            <Reports />
                          </ProtectedRoute>
                        } 
                      />
                      
                      {/* Admin-only routes */}
                      <Route 
                        path="/settings" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <Settings />
                          </ProtectedRoute>
                        } 
                      />

                      {/* 404 page */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
                <Analytics />
                <SpeedInsights />
              </TooltipProvider>
            </CurrencyProvider>
          </BusinessProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
