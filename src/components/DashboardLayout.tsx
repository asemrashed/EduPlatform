'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="h-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <Header />
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden">
          {/* Mathematical Symbols Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Small Plus Symbol (+) */}
              <div className="absolute top-20 right-20 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-0.5 absolute" style={{ backgroundColor: '#EC4899' }}></div>
                <div className="w-0.5 h-6 absolute" style={{ backgroundColor: '#EC4899' }}></div>
              </div>
              
              {/* Division Symbol (÷) */}
              <div className="absolute top-32 left-16 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-0.5 absolute" style={{ backgroundColor: '#A855F7' }}></div>
                <div className="w-1 h-1 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" style={{ backgroundColor: '#A855F7' }}></div>
                <div className="w-1 h-1 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2" style={{ backgroundColor: '#A855F7' }}></div>
              </div>
              
              {/* Square Root Symbol (√) */}
              <div className="absolute top-48 right-32 w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-0.5 absolute top-2 left-2 transform rotate-45" style={{ backgroundColor: '#7B2CBF' }}></div>
                <div className="w-0.5 h-4 absolute top-2 left-2" style={{ backgroundColor: '#7B2CBF' }}></div>
                <div className="w-2 h-0.5 absolute top-4 left-4" style={{ backgroundColor: '#7B2CBF' }}></div>
              </div>
              
              {/* Compass Symbol */}
              <div className="absolute bottom-32 left-20 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-6 border rounded-full relative" style={{ borderColor: '#10B981' }}>
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-3 transform -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: '#10B981' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 transform -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: '#10B981' }}></div>
                </div>
              </div>
              
              {/* Infinity Symbol (∞) */}
              <div className="absolute bottom-20 right-16 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-3 border rounded-full relative" style={{ borderColor: '#FF6B35' }}>
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 rounded-tl-full" style={{ borderColor: '#FF6B35' }}></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 rounded-br-full" style={{ borderColor: '#FF6B35' }}></div>
                </div>
              </div>
              
              {/* Pi Symbol (π) */}
              <div className="absolute top-64 left-32 w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 border-l-2 border-t-2 border-r-2 rounded-t-full" style={{ borderColor: '#EC4899' }}></div>
                <div className="w-0.5 h-2 absolute top-2 left-1/2 transform -translate-x-1/2" style={{ backgroundColor: '#EC4899' }}></div>
              </div>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(135deg, transparent 0%, rgba(236, 72, 153, 0.05) 50%, rgba(168, 85, 247, 0.05) 100%)",
          }}></div>
          
          {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
