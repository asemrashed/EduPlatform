import {
  getMockAdminDashboardFull,
  getMockInstructorDashboard,
  getMockStudentDashboardComposite,
} from "@/mock/dashboard";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AdminDashboardApiPayload,
  DashboardRole,
  InstructorDashboardApiPayload,
} from "@/types/dashboard";
import type { StudentDashboardComposite } from "@/types/studentDashboard";

/** Mock-only dashboard reads — no `fetch` (Phase 4). */
export async function getStudentDashboard(): Promise<StudentDashboardComposite> {
  await Promise.resolve();
  // No dedicated `/api/student/dashboard` route in moynamoti-main.
  return getMockStudentDashboardComposite();
}

export async function getInstructorDashboard(): Promise<InstructorDashboardApiPayload> {
  await Promise.resolve();
  void API_ENDPOINTS.INSTRUCTOR_DASHBOARD;
  return getMockInstructorDashboard();
}

export async function getAdminDashboard(): Promise<AdminDashboardApiPayload> {
  await Promise.resolve();
  void API_ENDPOINTS.ADMIN_DASHBOARD;
  return getMockAdminDashboardFull();
}

export async function getDashboardByRole(role: DashboardRole) {
  switch (role) {
    case "student":
      return { role, data: await getStudentDashboard() } as const;
    case "instructor":
      return { role, data: await getInstructorDashboard() } as const;
    case "admin":
      return { role, data: await getAdminDashboard() } as const;
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}
