/**
 * Auth Sync Indicator - Premium subtle indicator
 * Shows when auth is being validated in background
 * Like Gmail's subtle sync indicator
 */

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AuthSyncIndicatorProps {
  className?: string;
}

export function AuthSyncIndicator({ className }: AuthSyncIndicatorProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Listen for custom auth sync events
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => setIsSyncing(false);

    window.addEventListener('auth:sync:start', handleSyncStart);
    window.addEventListener('auth:sync:end', handleSyncEnd);

    return () => {
      window.removeEventListener('auth:sync:start', handleSyncStart);
      window.removeEventListener('auth:sync:end', handleSyncEnd);
    };
  }, []);

  if (!isSyncing) return null;

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg text-xs text-muted-foreground animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>Syncing...</span>
    </div>
  );
}

// Utility to dispatch sync events
export const authSyncEvents = {
  start: () => window.dispatchEvent(new Event('auth:sync:start')),
  end: () => window.dispatchEvent(new Event('auth:sync:end'))
};
