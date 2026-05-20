import type { Metadata } from "next";
import InstructorPastPapersPage from "./InstructorPastPapersClient";

export const metadata: Metadata = {
  title: "Past papers",
};

export default function InstructorPastPapersRoutePage() {
  return <InstructorPastPapersPage />;
}
