"use client";

import { useState, useEffect } from 'react';

interface UseScrollThresholdOptions {
  /**
   * The pixel threshold to check against
   * @default 0
   */
  threshold?: number;
  
  /**
   * Direction to check: 'down' (from top) or 'up' (from bottom)
   * @default 'down'
   */
  direction?: 'down' | 'up';
  
  /**
   * Whether to enable the hook
   * @default true
   */
  enabled?: boolean;
}

/**
 * Hook to check if the user has scrolled a given pixel amount
 * 
 * @param options Configuration options
 * @returns Object containing whether threshold is reached and current scroll position
 * 
 * @example
 * // Check if scrolled 100px from top
 * const { hasScrolled, scrollY } = useScrollThreshold({ threshold: 100 });
 * 
 * @example
 * // Check if within 100px of bottom
 * const { hasScrolled, scrollY } = useScrollThreshold({ 
 *   threshold: 100, 
 *   direction: 'up' 
 * });
 */
export const useScrollThreshold = ({
  threshold = 0,
  direction = 'down',
  enabled = true,
}: UseScrollThresholdOptions = {}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [distanceFromBottom, setDistanceFromBottom] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setHasScrolled(false);
      return;
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || window.pageYOffset;
      const distanceFromBottomValue = documentHeight - (scrollTop + windowHeight);

      setScrollY(scrollTop);
      setDistanceFromBottom(distanceFromBottomValue);

      if (direction === 'down') {
        // Check if scrolled threshold pixels from top
        setHasScrolled(scrollTop >= threshold);
      } else {
        // Check if within threshold pixels from bottom
        setHasScrolled(distanceFromBottomValue <= threshold);
      }
    };

    // Check initial position
    handleScroll();

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold, direction, enabled]);

  return {
    hasScrolled,
    scrollY,
    distanceFromBottom,
  };
};

