import { redirect } from "next/navigation";

export default async function InstructorBatchSubjectRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/instructor/batches/${id}?tab=curriculum`);
}
