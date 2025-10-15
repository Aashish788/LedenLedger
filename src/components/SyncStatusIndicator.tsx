/**
 * Sync Status Indicator Component
 * 
 * Displays current sync status to users with visual feedback
 * 
 * @version 1.0.0
 */

import { useSyncStatus } from '@/hooks/useRealtimeSync';
import { Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SyncStatusIndicator() {
  const { syncStatus, forceSync } = useSyncStatus();

  const handleForceSync = () => {
    toast.info('Syncing...', { description: 'Uploading pending changes' });
    forceSync();
  };

  // Don't show anything if everything is fine and no pending operations
  if (syncStatus.isOnline && syncStatus.isConnected && syncStatus.pendingOperations === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600">
        <Check className="h-4 w-4" />
        <span>Synced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Offline Indicator */}
      {!syncStatus.isOnline && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
          <CloudOff className="h-4 w-4" />
          <span>Offline Mode</span>
        </div>
      )}

      {/* Connection Error */}
      {syncStatus.isOnline && !syncStatus.isConnected && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
          <AlertCircle className="h-4 w-4" />
          <span>Connection Lost</span>
        </div>
      )}

      {/* Pending Operations */}
      {syncStatus.pendingOperations > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSync}
          className="flex items-center gap-2 text-xs"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{syncStatus.pendingOperations} pending</span>
        </Button>
      )}

      {/* Connected and Syncing */}
      {syncStatus.isOnline && syncStatus.isConnected && syncStatus.pendingOperations === 0 && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Cloud className="h-4 w-4" />
          <span>Connected</span>
        </div>
      )}
    </div>
  );
}
