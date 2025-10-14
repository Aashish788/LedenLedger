/**
 * Error Boundary Component for Graceful Error Handling
 * Catches and displays React errors instead of crashing the app
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: ''
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substring(7)
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId: Math.random().toString(36).substring(7)
    });

    // In production, send error to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement error logging service integration
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // For now, just log to console
    console.error('Error Report:', errorReport);
    
    // In production, send to error tracking service like Sentry
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private copyErrorDetails = () => {
    const errorDetails = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Error details copied to clipboard');
    }).catch(() => {
      console.error('Failed to copy error details');
    });
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-card border rounded-lg p-8 text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="h-16 w-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>

              {/* Error Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground mb-4">
                  We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <p className="text-sm font-mono text-foreground break-all">
                    Error ID: <span className="text-primary">{this.state.errorId}</span>
                  </p>
                  {this.state.error && (
                    <p className="text-sm font-mono text-destructive mt-2">
                      {this.state.error.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Developer Info (only in development) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    <Bug className="inline h-4 w-4 mr-2" />
                    Developer Details
                  </summary>
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    {this.state.error && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Error:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.error?.stack && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Stack Trace:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-64">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Component Stack:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-64">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={this.copyErrorDetails}
                      className="mt-4"
                    >
                      Copy Error Details
                    </Button>
                  </div>
                </details>
              )}

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please contact support with Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // In production, send to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error Report:', errorReport);
  };
};

export default ErrorBoundary;
