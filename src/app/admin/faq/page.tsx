import type { Metadata } from "next";
import FAQPage from "./AdminFaqClient";

export const metadata: Metadata = {
  title: "Course FAQ",
};

export default function AdminFaqRoutePage() {
  return <FAQPage />;
}
