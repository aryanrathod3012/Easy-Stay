import { useState, useEffect, useRef } from 'react';

const THRESHOLD = 70; // px of pull needed to trigger refresh

/**
 * Attaches touch-based pull-to-refresh on the window scroll container.
 * Returns { isPulling, pullProgress (0-1), isRefreshing }.
 * Calls onRefresh() when threshold is crossed.
 */
export default function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(null);

  useEffect(() => {
    const el = document.documentElement;

    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (startY.current === null) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullY(Math.min(delta, THRESHOLD * 1.5));
        setIsPulling(true);
      }
    };

    const onTouchEnd = async () => {
      if (pullY >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullY(0);
        setIsPulling(false);
        await onRefresh();
        setIsRefreshing(false);
      } else {
        setPullY(0);
        setIsPulling(false);
      }
      startY.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [pullY, isRefreshing, onRefresh]);

  return { isPulling, pullProgress: Math.min(pullY / THRESHOLD, 1), isRefreshing };
}
