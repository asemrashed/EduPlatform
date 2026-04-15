import type { Metadata } from "next";
import StudentCourseLearningPage from "./StudentCourseDetailClient";

export const metadata: Metadata = {
  title: "Course",
};

export default function StudentCourseDetailPage() {
  return <StudentCourseLearningPage />;
}
