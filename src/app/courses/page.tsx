import type { Metadata } from "next";
import { CoursesCatalogClient } from "./CoursesCatalogClient";

export const metadata: Metadata = {
  title: "All Courses",
};

/** AllCourse.html layout; data from Redux + static supplement (mock api client). */
export default function CoursesPage() {
  return <CoursesCatalogClient />;
}
