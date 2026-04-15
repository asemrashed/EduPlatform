import type { Metadata } from "next";
import { StudentPassPapersClient } from "./StudentPassPapersClient";

export const metadata: Metadata = {
  title: "Pass papers",
};

export default function StudentPassPapersPage() {
  return <StudentPassPapersClient />;
}
