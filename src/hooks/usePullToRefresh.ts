import { useEffect, useRef, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const scrollElement = useRef<HTMLElement | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    const element = e.target as HTMLElement;
    scrollElement.current = element.closest('[data-pull-to-refresh]') as HTMLElement;
    
    if (!scrollElement.current) return;
    
    // Only start if we're at the top of the scroll
    if (scrollElement.current.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling || !enabled || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0 && scrollElement.current?.scrollTop === 0) {
      e.preventDefault();
      const distance = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || !enabled) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  };

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isPulling, pullDistance, threshold, resistance, onRefresh]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    shouldTrigger: pullDistance >= threshold
  };
};