import type { Metadata } from "next";
import InstructorQuestionsPage from "./InstructorExamQuestionsClient";

export const metadata: Metadata = {
  title: "Exam questions",
};

export default function InstructorExamQuestionsRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InstructorQuestionsPage params={params} />;
}
