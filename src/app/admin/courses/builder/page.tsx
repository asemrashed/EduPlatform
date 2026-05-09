import type { Metadata } from "next";
import CourseBuilderPage from "./AdminCourseBuilderClient";
import UnifiedCourseBuilder from "@/app/components/CourseBuilder";

export const metadata: Metadata = {
  title: "Course builder",
};

export default function AdminCourseBuilderRoutePage() {
  // return <CourseBuilderPage />;
  return <UnifiedCourseBuilder  role="admin" />;
}
