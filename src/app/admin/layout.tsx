import { RoleAreaLayout } from "@/components/layout/RoleAreaLayout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleAreaLayout role="admin">{children}</RoleAreaLayout>;
}
