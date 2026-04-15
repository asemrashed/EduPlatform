'use client';

import { ReactNode } from 'react';
import PageSection from '@/components/PageSection';
import PageGrid from '@/components/PageGrid';
import ContentArea from '@/components/ContentArea';

interface DashboardPageProps {
  children: ReactNode;
  className?: string;
}

const DashboardPage = ({ children, className = '' }: DashboardPageProps) => {
  return (
    <main className={`relative z-10 flex-1 overflow-hidden p-2 sm:p-4 ${className}`}>
      {children}
    </main>
  );
};

// Export individual components for convenience
export { PageSection, PageGrid, ContentArea };
export default DashboardPage;
