import type { Metadata } from "next";
import { BatchListClient } from "@/components/batches/BatchListClient";

export const metadata: Metadata = {
  title: "My batches",
};

export default function StudentBatchesPage() {
  return (
    <BatchListClient
      detailBasePath="/student/batches"
      emptyMessage="You are not enrolled in any batches yet."
    />
  );
}
