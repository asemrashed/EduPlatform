import type { Metadata } from "next";
import { InstructorRoleShell } from "@/components/role-area/InstructorRoleShell";
import { BatchDetailWorkspace } from "@/components/batches/BatchDetailWorkspace";

export const metadata: Metadata = {
  title: "Batch detail",
};

export default async function InstructorBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <InstructorRoleShell>
      <BatchDetailWorkspace batchId={id} listHref="/instructor/batches" />
    </InstructorRoleShell>
  );
}
