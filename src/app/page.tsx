import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title: "Home",
  description:
    "EduPlatform — online courses, learning paths, and expert-led programs.",
};

/** Phase 3: marketing home; featured courses from Redux (mock api client). */
export default function HomePage() {
  return <HomePageClient />;
}
