"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    dispatch(setDashboardView(role));
  }, [dispatch, role]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== role) {
      router.replace("/login");
    }
  }, [pathname, role, router, session?.user, status]);

  if (status === "loading") {
    return null;
  }

  if (!session?.user || session.user.role !== role) {
    return null;
  }

  return <DashboardRouteLayout>{children}</DashboardRouteLayout>;
}
