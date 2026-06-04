import type { Metadata } from "next";
import AdminPageWrapper from "@/components/AdminPageWrapper";
import { BatchListClient } from "@/components/batches/BatchListClient";

export const metadata: Metadata = {
  title: "Batches",
};

export default function AdminBatchesPage() {
  return (
    <AdminPageWrapper>
      <BatchListClient
        detailBasePath="/admin/batches"
        allowCreate
        requireInstructorId
      />
    </AdminPageWrapper>
  );
}
