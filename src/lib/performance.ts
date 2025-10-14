/**
 * Performance optimization utilities and monitoring
 */

import { useEffect, useRef, useCallback, useMemo } from 'react';

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const throttledRef = useRef<T>();
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  { threshold = 0, root = null, rootMargin = '0%' }: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = React.useState<boolean>(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold, root, rootMargin]);

  return isVisible;
}

// Performance monitoring utilities
export const performance = {
  // Measure function execution time
  measure: <T extends (...args: any[]) => any>(
    name: string,
    fn: T
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  // Measure async function execution time
  measureAsync: <T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }) as T;
  },

  // Monitor component render times
  trackRender: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      
      return () => {
        const end = performance.now();
        console.log(`[Render] ${componentName}: ${(end - start).toFixed(2)}ms`);
      };
    }
    
    return () => {};
  }
};

// Memory usage monitoring
export const memory = {
  getUsage: (): MemoryInfo | null => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  },

  logUsage: (context: string) => {
    if (process.env.NODE_ENV === 'development') {
      const memInfo = memory.getUsage();
      if (memInfo) {
        console.log(`[Memory] ${context}:`, {
          used: `${(memInfo.usedJSHeapSize / 1048576).toFixed(2)}MB`,
          total: `${(memInfo.totalJSHeapSize / 1048576).toFixed(2)}MB`,
          limit: `${(memInfo.jsHeapSizeLimit / 1048576).toFixed(2)}MB`
        });
      }
    }
  }
};

// Bundle size monitoring
export const bundleAnalyzer = {
  // Track when modules are loaded
  trackModuleLoad: (moduleName: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle] Module loaded: ${moduleName}`);
    }
  },

  // Monitor chunk loading
  trackChunkLoad: (chunkName: string, size?: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bundle] Chunk loaded: ${chunkName}${size ? ` (${size} bytes)` : ''}`);
    }
  }
};

// Image optimization utilities
export const imageOptimization = {
  // Create optimized image URL with WebP fallback
  getOptimizedImageUrl: (src: string, width?: number, height?: number): string => {
    // This would integrate with your image optimization service
    // For now, just return the original src
    return src;
  },

  // Lazy load images
  useLazyImage: (src: string) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const isVisible = useIntersectionObserver(imgRef, { threshold: 0.1 });
    const [loaded, setLoaded] = React.useState(false);

    useEffect(() => {
      if (isVisible && !loaded) {
        const img = new Image();
        img.onload = () => setLoaded(true);
        img.src = src;
      }
    }, [isVisible, loaded, src]);

    return { imgRef, loaded, shouldLoad: isVisible };
  }
};

// Network optimization
export const networkOptimization = {
  // Preload critical resources
  preloadResource: (href: string, as: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch resources for future navigation
  prefetchResource: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Monitor network status
  useNetworkStatus: () => {
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    const [connectionType, setConnectionType] = React.useState<string>('unknown');

    useEffect(() => {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Get connection type if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setConnectionType(connection.effectiveType || 'unknown');
        
        const handleConnectionChange = () => {
          setConnectionType(connection.effectiveType || 'unknown');
        };
        
        connection.addEventListener('change', handleConnectionChange);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          connection.removeEventListener('change', handleConnectionChange);
        };
      }
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

    return { isOnline, connectionType };
  }
};

export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  performance,
  memory,
  bundleAnalyzer,
  imageOptimization,
  networkOptimization
};
