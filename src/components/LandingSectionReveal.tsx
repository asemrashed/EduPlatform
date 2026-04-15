'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface LandingSectionRevealProps {
  children: ReactNode;
  className?: string;
}

export default function LandingSectionReveal({ children, className = '' }: LandingSectionRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}
