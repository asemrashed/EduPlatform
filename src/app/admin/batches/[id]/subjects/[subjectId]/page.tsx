import type { Metadata } from "next";
import AdminPageWrapper from "@/components/AdminPageWrapper";
import { SubjectCurriculumPanel } from "@/components/batches/SubjectCurriculumPanel";

export const metadata: Metadata = {
  title: "Subject curriculum",
};

export default async function AdminBatchSubjectPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>;
}) {
  const { id, subjectId } = await params;
  return (
    <AdminPageWrapper>
      <div className="p-4 md:p-6">
        <SubjectCurriculumPanel
          batchId={id}
          subjectId={subjectId}
          backHref={`/admin/batches/${id}`}
        />
      </div>
    </AdminPageWrapper>
  );
}
