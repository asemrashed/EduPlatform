import type { Metadata } from "next";
import CourseBuilderPage from "./InstructorCourseBuilderClient";

export const metadata: Metadata = {
  title: "Course builder",
};

export default function InstructorCourseBuilderRoutePage() {
  return <CourseBuilderPage />;
}
