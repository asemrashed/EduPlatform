import type { Metadata } from "next";
import { InstructorRoleShell } from "@/components/role-area/InstructorRoleShell";
import { BatchListClient } from "@/components/batches/BatchListClient";

export const metadata: Metadata = {
  title: "Batches",
};

export default function InstructorBatchesPage() {
  return (
    <InstructorRoleShell>
      <BatchListClient detailBasePath="/instructor/batches" allowCreate />
    </InstructorRoleShell>
  );
}
