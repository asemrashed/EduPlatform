import type { Metadata } from "next";
import { BatchDetailWorkspace } from "@/components/batches/BatchDetailWorkspace";

export const metadata: Metadata = {
  title: "Batch",
};

export default async function StudentBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <BatchDetailWorkspace
      batchId={id}
      listHref="/student/batches"
      titlePrefix="My batch"
      workspaceRole="student"
    />
  );
}
