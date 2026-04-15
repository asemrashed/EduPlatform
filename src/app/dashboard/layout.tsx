import { DashboardRouteLayout } from "./DashboardRouteLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRouteLayout>{children}</DashboardRouteLayout>;
}
