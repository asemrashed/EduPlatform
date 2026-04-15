import type { Metadata } from "next";
import CourseBuilderPage from "./AdminCourseBuilderClient";

export const metadata: Metadata = {
  title: "Course builder",
};

export default function AdminCourseBuilderRoutePage() {
  return <CourseBuilderPage />;
}
