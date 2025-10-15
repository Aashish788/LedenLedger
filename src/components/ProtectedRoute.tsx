/**
 * Protected Route Component - Premium Edition
 * Instant navigation like Gmail/Khatabook
 * - No loading states on route changes
 * - Trust cached auth state
 * - Background validation only
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // REMOVED: Session check on route change - causes flickering
  // The AuthContext handles session validation in background
  // This provides instant navigation like premium apps

  // Only show loading on initial app load (not on route changes)
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check admin privileges if required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="mb-4">
            <div className="h-12 w-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <svg 
                className="h-6 w-6 text-destructive" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Admin privileges required.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Public Route Component - Only accessible when NOT authenticated
 * Instant redirects without loading states
 */
interface PublicOnlyRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export function PublicOnlyRoute({ children, redirectPath = '/dashboard' }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Only show loading on initial app load
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Instant redirect if authenticated (no loading state)
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
