"use client";

import { DashboardSidebar } from "./DashboardSidebar";

/**
 * Dashboard shell: persistent left column + scrollable main (matches learning-project
 * Student / Instructor / Admin sidebar + content pattern). Sidebar reads role from Redux.
 */
export function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
}
