import type { Metadata } from "next";
import { StudentPastPapersClient } from "./StudentPastPapersClient";

export const metadata: Metadata = {
  title: "Past papers",
};

export default function StudentPastPapersPage() {
  return <StudentPastPapersClient />;
}
