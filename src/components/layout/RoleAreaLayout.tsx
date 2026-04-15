"use client";

import { useEffect, type ReactNode } from "react";
import { DashboardRouteLayout } from "@/app/dashboard/DashboardRouteLayout";
import { useAppDispatch } from "@/store/hooks";
import { setDashboardView } from "@/store/slices/uiSlice";
import type { DashboardRole } from "@/types/dashboard";

/**
 * Wraps role-scoped routes (`/student/*`, `/instructor/*`, `/admin/*`): syncs
 * `ui.dashboardView` for sidebar styling + Redux dashboard loads, and applies
 * the persistent sidebar + main shell (same as `/dashboard`).
 */
export function RoleAreaLayout({
  role,
  children,
}: {
  role: DashboardRole;
  children: ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDashboardView(role));
  }, [dispatch, role]);

  return <DashboardRouteLayout>{children}</DashboardRouteLayout>;
}
