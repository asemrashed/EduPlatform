import type { Metadata } from "next";
import StudentCourses from "./StudentCoursesClient";

export const metadata: Metadata = {
  title: "My courses",
};

export default function StudentCoursesPage() {
  return <StudentCourses />;
}
