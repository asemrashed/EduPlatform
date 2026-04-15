"use client";

import { useAppSelector } from "@/store/hooks";

export type MockSessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

/**
 * Replaces `next-auth` `useSession` for mock / Phase 5 role-area pages.
 * `auth.user` is set by `RoleAreaPathTracker` in Providers per route prefix.
 */
export function useMockSession() {
  const user = useAppSelector((s) => s.auth.user);

  const fallback = {
    id: "mock-user-id",
    email: "student@eduplatform.local",
    name: "Mock Student",
    role: "student" as const,
  };

  if (!user) {
    return {
      data: { user: fallback },
      status: "authenticated" as MockSessionStatus,
    };
  }

  return {
    data: {
      user: {
        id: user.id ?? user._id,
        email: user.email,
        name:
          user.name ??
          (`${user.firstName} ${user.lastName}`.trim() || user.email),
        role: user.role,
      },
    },
    status: "authenticated" as MockSessionStatus,
  };
}
