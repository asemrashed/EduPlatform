import type { Metadata } from "next";
import Image from "next/image";

import { loadWebsiteContentSettings } from "@/app/api/_lib/websiteContentStore";
import {
  defaultAboutPageContent,
  defaultWebsiteContent,
  type WebsiteContent,
} from "@/lib/websiteContentDefaults";
import { SiteSocialLinks } from "@/components/layout/SiteSocialLinks";
import { AboutFeaturesCards } from "@/components/features/AboutFeaturesCards";
import { resolveFeaturesContent } from "@/lib/resolveFeaturesContent";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage() {
  const raw = await loadWebsiteContentSettings();
  const cmsData = raw as unknown as WebsiteContent;

  const aboutPage = {
    ...defaultAboutPageContent,
    ...(cmsData?.aboutPage ?? {}),
  };
  const socialMedia = {
    ...defaultWebsiteContent.socialMedia,
    ...(cmsData?.socialMedia ?? {}),
  };

  const heading = aboutPage.heading?.trim() || defaultAboutPageContent.heading;
  const description =
    aboutPage.description?.trim() || defaultAboutPageContent.description;
  const aboutContent =
    aboutPage.aboutContent?.trim() || defaultAboutPageContent.aboutContent;
  const imageUrl = aboutPage.imageUrl?.trim() || defaultAboutPageContent.imageUrl;
  const featuresContent = resolveFeaturesContent(cmsData);

  return (
    <div className="mx-auto max-w-screen-2xl pb-5 md:pb-10">
      <section className="relative flex min-h-[320px] items-center overflow-hidden bg-primary px-8 py-16 md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-container" />
        <div className="relative z-10 w-full">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-headline)] text-4xl font-black leading-[1.1] tracking-tight text-white md:text-6xl">
              {heading}
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-on-primary-container/90">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 items-center gap-12 p-6 md:grid-cols-2 md:p-10">
        <div>
          <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
            {aboutContent}
          </p>
          <SiteSocialLinks links={socialMedia} className="mt-8" />
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-editorial">
          <Image
            src={imageUrl}
            alt="About us"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <AboutFeaturesCards content={featuresContent} />
    </div>
  );
}
