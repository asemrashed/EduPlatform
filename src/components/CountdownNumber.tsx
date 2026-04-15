"use client";

import { useCountdown } from '@/hooks/useCountdown';

interface CountdownNumberProps {
  endValue: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function CountdownNumber({ 
  endValue, 
  suffix = '', 
  duration = 2000, 
  delay = 0,
  className = ''
}: CountdownNumberProps) {
  const { currentValue, isAnimating } = useCountdown({
    endValue,
    duration,
    delay,
    startValue: 0
  });

  // Format the number to handle decimals properly
  const formatValue = (value: number) => {
    if (value % 1 === 0) {
      return value.toString();
    }
    return value.toFixed(1);
  };

  return (
    <div className={`transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'} ${className}`}>
      {formatValue(currentValue)}{suffix}
    </div>
  );
}
