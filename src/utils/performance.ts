// Debounce utility for search and input handling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll and touch events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Request animation frame utility
export const raf = (callback: () => void): number => {
  return requestAnimationFrame(callback);
};

// Cancel animation frame
export const cancelRaf = (id: number): void => {
  cancelAnimationFrame(id);
};

// Batch DOM updates
export const batchUpdates = (updates: (() => void)[]): void => {
  raf(() => {
    updates.forEach(update => update());
  });
};

// Check if device has reduced motion preference
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get device performance tier
export const getPerformanceTier = (): 'low' | 'medium' | 'high' => {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1;
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory || 1;
  
  // Check connection type
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  
  // Simple heuristic for performance tier
  if (cores >= 8 && memory >= 4 && effectiveType === '4g') {
    return 'high';
  } else if (cores >= 4 && memory >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Optimize for performance tier
export const getOptimizedSettings = () => {
  const tier = getPerformanceTier();
  const reducedMotion = prefersReducedMotion();
  
  return {
    animations: !reducedMotion && tier !== 'low',
    shadows: tier === 'high',
    transitions: !reducedMotion,
    maxNodes: tier === 'low' ? 100 : tier === 'medium' ? 500 : 1000,
    debounceMs: tier === 'low' ? 300 : tier === 'medium' ? 200 : 150
  };
};

// Memory management
export const cleanupUnusedMemory = (): void => {
  // Force garbage collection if available (Chrome DevTools)
  if ((window as any).gc) {
    (window as any).gc();
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  const duration = end - start;
  
  console.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
  return duration;
};

// Intersection Observer for virtualization
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  });
};