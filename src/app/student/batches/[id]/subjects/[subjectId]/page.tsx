import type { Metadata } from "next";
import { StudentSubjectLearningClient } from "@/components/batches/StudentSubjectLearningClient";

export const metadata: Metadata = {
  title: "Subject",
};

export default async function StudentBatchSubjectPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>;
}) {
  const { id, subjectId } = await params;
  return (
    <StudentSubjectLearningClient
      batchId={id}
      subjectId={subjectId}
      backHref={`/student/batches/${id}`}
    />
  );
}
