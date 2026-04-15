'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import TeacherSidebar from '@/components/TeacherSidebar';
import Header from '@/components/Header';

interface TeacherDashboardLayoutProps {
  children: ReactNode;
}

const TeacherDashboardLayout = ({ children }: TeacherDashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <TeacherSidebar />
      <SidebarInset className="flex flex-col min-h-svh h-svh overflow-hidden bg-background">
        <Header />
        <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-background">
          {/* Mathematical Symbols Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Small Plus Symbol (+) */}
              <div className="absolute top-20 right-20 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-purple-300 absolute"></div>
                <div className="w-0.5 h-6 bg-purple-300 absolute"></div>
              </div>
              
              {/* Division Symbol (÷) */}
              <div className="absolute top-32 left-16 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-0.5 bg-indigo-300 absolute"></div>
                <div className="w-1 h-1 bg-indigo-300 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                <div className="w-1 h-1 bg-indigo-300 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
              </div>
              
              {/* Square Root Symbol (√) */}
              <div className="absolute top-48 right-32 w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-0.5 bg-purple-300 absolute top-2 left-2 transform rotate-45"></div>
                <div className="w-0.5 h-4 bg-purple-300 absolute top-2 left-2"></div>
                <div className="w-2 h-0.5 bg-purple-300 absolute top-4 left-4"></div>
              </div>
              
              {/* Compass Symbol */}
              <div className="absolute bottom-32 left-20 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-6 border border-purple-300 rounded-full relative">
                  <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-purple-300 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-purple-300 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              
              {/* Infinity Symbol (∞) */}
              <div className="absolute bottom-20 right-16 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-3 border border-orange-300 rounded-full relative">
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-orange-300 rounded-tl-full"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-orange-300 rounded-br-full"></div>
                </div>
              </div>
              
              {/* Pi Symbol (π) */}
              <div className="absolute top-64 left-32 w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 border-l-2 border-t-2 border-r-2 border-purple-300 rounded-t-full"></div>
                <div className="w-0.5 h-2 bg-purple-300 absolute top-2 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-50/10 to-indigo-50/10 pointer-events-none"></div>
          
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TeacherDashboardLayout;
