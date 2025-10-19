/**
 * AbortController Utility - Industry-Grade Request Cancellation
 * 
 * Prevents memory leaks and "setState on unmounted component" warnings
 * by properly canceling all pending requests when components unmount.
 * 
 * Used by all service methods to ensure clean request lifecycle management.
 * 
 * @version 1.0.0
 * @author Senior Backend Developer
 */

/**
 * Creates an AbortController with automatic cleanup
 * Use this in React hooks/components to cancel requests on unmount
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   const controller = createAbortController();
 *   
 *   fetchData(controller.signal).catch(err => {
 *     if (err.name === 'AbortError') return; // Request was cancelled
 *     console.error(err);
 *   });
 *   
 *   return controller.cleanup;
 * }, []);
 * ```
 */
export function createAbortController() {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    cleanup: () => controller.abort(),
  };
}

/**
 * Manager for multiple AbortControllers
 * Use this when you need to manage multiple concurrent requests
 * 
 * @example
 * ```tsx
 * const manager = new AbortControllerManager();
 * 
 * // Create tracked request
 * const id1 = manager.create();
 * fetchData(manager.getSignal(id1));
 * 
 * // Create another
 * const id2 = manager.create();
 * fetchOtherData(manager.getSignal(id2));
 * 
 * // Abort specific request
 * manager.abort(id1);
 * 
 * // Or abort all on cleanup
 * useEffect(() => {
 *   return () => manager.abortAll();
 * }, []);
 * ```
 */
export class AbortControllerManager {
  private controllers: Map<string, AbortController> = new Map();
  
  /**
   * Create a new AbortController and return its ID
   */
  create(id?: string): string {
    const controllerId = id || this.generateId();
    const controller = new AbortController();
    this.controllers.set(controllerId, controller);
    return controllerId;
  }
  
  /**
   * Get the signal for a specific controller
   */
  getSignal(id: string): AbortSignal | undefined {
    return this.controllers.get(id)?.signal;
  }
  
  /**
   * Abort a specific request
   */
  abort(id: string): void {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
      this.controllers.delete(id);
    }
  }
  
  /**
   * Abort all pending requests
   */
  abortAll(): void {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
  }
  
  /**
   * Get count of active controllers
   */
  getActiveCount(): number {
    return this.controllers.size;
  }
  
  /**
   * Check if a request is still active
   */
  isActive(id: string): boolean {
    return this.controllers.has(id);
  }
  
  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Wrap Supabase queries with AbortController support
 * Since Supabase doesn't natively support AbortSignal, we use a race condition
 * 
 * @example
 * ```tsx
 * const controller = createAbortController();
 * 
 * const { data, error } = await withAbortController(
 *   supabase.from('customers').select('*'),
 *   controller.signal
 * );
 * ```
 */
export async function withAbortController<T>(
  promise: Promise<T>,
  signal: AbortSignal
): Promise<T> {
  // If already aborted, reject immediately
  if (signal.aborted) {
    throw new DOMException('Request aborted', 'AbortError');
  }
  
  // Race between the promise and abort signal
  return new Promise((resolve, reject) => {
    // Setup abort listener
    const onAbort = () => {
      reject(new DOMException('Request aborted', 'AbortError'));
    };
    
    signal.addEventListener('abort', onAbort);
    
    // Execute the promise
    promise
      .then(result => {
        signal.removeEventListener('abort', onAbort);
        resolve(result);
      })
      .catch(error => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      });
  });
}

/**
 * Helper to check if an error is an AbortError
 * Use this to filter out cancelled request errors
 * 
 * @example
 * ```tsx
 * try {
 *   await fetchData(signal);
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     // Request was cancelled, this is expected
 *     return;
 *   }
 *   // Handle actual error
 *   console.error(error);
 * }
 * ```
 */
export function isAbortError(error: any): boolean {
  return error?.name === 'AbortError' || error?.code === 'ABORT_ERR';
}

/**
 * Create a timeout-based AbortController
 * Automatically aborts after specified milliseconds
 * 
 * @example
 * ```tsx
 * const { signal, cleanup } = createTimeoutController(5000); // 5 second timeout
 * 
 * try {
 *   await fetchData(signal);
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     console.log('Request timed out');
 *   }
 * } finally {
 *   cleanup();
 * }
 * ```
 */
export function createTimeoutController(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    signal: controller.signal,
    abort: () => {
      clearTimeout(timeoutId);
      controller.abort();
    },
    cleanup: () => {
      clearTimeout(timeoutId);
      controller.abort();
    },
  };
}

/**
 * Export default manager instance for use across services
 */
export const globalAbortManager = new AbortControllerManager();
