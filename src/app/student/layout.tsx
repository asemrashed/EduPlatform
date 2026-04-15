import { RoleAreaLayout } from "@/components/layout/RoleAreaLayout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleAreaLayout role="student">{children}</RoleAreaLayout>;
}
