import type { Metadata } from "next";
import InstructorPassPapersPage from "./InstructorPassPapersClient";

export const metadata: Metadata = {
  title: "Pass papers",
};

export default function InstructorPassPapersRoutePage() {
  return <InstructorPassPapersPage />;
}
