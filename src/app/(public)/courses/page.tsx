import type { Metadata } from "next";
import { CoursesCatalogClient } from "@/app/courses/CoursesCatalogClient";

export const metadata: Metadata = {
  title: "All Courses",
};

/** AllCourse.html layout; data from Redux + static supplement (mock api client). */
export default function CoursesPage() {
  return <CoursesCatalogClient />;
}
