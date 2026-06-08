import type { Metadata } from "next";
import AdminPageWrapper from "@/components/AdminPageWrapper";
import { BatchDetailWorkspace } from "@/components/batches/BatchDetailWorkspace";

export const metadata: Metadata = {
  title: "Batch detail",
};

export default async function AdminBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminPageWrapper>
      <BatchDetailWorkspace
        batchId={id}
        listHref="/admin/batches"
        workspaceRole="admin"
      />
    </AdminPageWrapper>
  );
}
