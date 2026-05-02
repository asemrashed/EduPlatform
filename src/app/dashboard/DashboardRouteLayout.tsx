"use client";

import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";

/**
 * Dashboard shell shared by all 3 roles (admin / instructor / student).
 *
 * Desktop & Tablet
 *   – Sidebar visible by default (defaultOpen={true})
 *   – SidebarTrigger in Header collapses it to icon-only, then expands again
 *
 * Mobile
 *   – Sidebar hidden by default (openMobile starts false in shadcn provider)
 *   – SidebarTrigger in Header slides it in as a Sheet overlay with backdrop
 *   – Clicking outside (backdrop) or the ✕ button inside the sidebar closes it
 */
export function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-svh w-full overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex min-h-svh min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header contains SidebarTrigger — works for all 3 roles */}
          <Header />
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
