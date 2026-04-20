import type { Metadata } from "next";
import { DashboardPageClient } from "@/app/dashboard/DashboardPageClient";

export const metadata: Metadata = {
  title: "Student dashboard",
};

export default function StudentDashboardPage() {
  return <DashboardPageClient fixedRole="student" />; // Student dashboard is composed from multiple endpoints (no single API)
}
