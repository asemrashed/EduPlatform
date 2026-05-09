import type { Metadata } from "next";
import CourseBuilderPage from "./InstructorCourseBuilderClient";
import UnifiedCourseBuilder from "@/app/components/CourseBuilder";

export const metadata: Metadata = {
  title: "Course builder",
};

export default function InstructorCourseBuilderRoutePage() {
  // return <CourseBuilderPage />;
  return <UnifiedCourseBuilder  role="instructor" />;
}
