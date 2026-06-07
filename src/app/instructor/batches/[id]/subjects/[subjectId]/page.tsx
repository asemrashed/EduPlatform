import type { Metadata } from "next";
import { SubjectCurriculumPanel } from "@/components/batches/SubjectCurriculumPanel";

export const metadata: Metadata = {
  title: "Subject curriculum",
};

export default async function InstructorBatchSubjectPage({
  params,
}: {
  params: Promise<{ id: string; subjectId: string }>;
}) {
  const { id, subjectId } = await params;
  return (
    <div className="p-4 md:p-6">
      <SubjectCurriculumPanel
        batchId={id}
        subjectId={subjectId}
        backHref={`/instructor/batches/${id}`}
      />
    </div>
  );
}
