import type { Metadata } from "next";
import PastPapersPage from "./AdminPastPapersClient";

export const metadata: Metadata = {
  title: "Past papers",
};

export default function AdminPastPapersRoutePage() {
  return <PastPapersPage />;
}
