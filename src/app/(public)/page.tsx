import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { loadWebsiteContentSettings } from "@/app/api/_lib/websiteContentStore";
import { getFeaturedReviews } from "@/lib/getFeaturedReviews";
import type { WebsiteContent } from "@/lib/websiteContentDefaults";

export const metadata: Metadata = {
  title: "Home",
  description:
    "EduPlatform — online courses, learning paths, and expert-led programs.",
};

/** Phase 3: marketing home; featured courses from Redux (mock api client). */
export default async function HomePage() {
  const [raw, featuredReviews] = await Promise.all([
    loadWebsiteContentSettings(),
    getFeaturedReviews(),
  ]);
  const cmsData = raw as unknown as WebsiteContent;

  return (
    <HomePageClient cmsData={cmsData} featuredReviews={featuredReviews} />
  );
}
