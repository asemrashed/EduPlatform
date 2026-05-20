import type { Metadata } from "next";
import Image from "next/image";

import { loadWebsiteContentSettings } from "@/app/api/_lib/websiteContentStore";
import {
  defaultAboutPageContent,
  defaultWhyChooseUsContent,
  type WebsiteContent,
} from "@/lib/websiteContentDefaults";
import { FEATURE_ICON_BY_TYPE } from "@/lib/featureIconMeta";
import { HOME_FEATURES } from "@/data/homePageContent";
import { cn } from "@/lib/cn";
import { SiteSocialLinks } from "@/components/layout/SiteSocialLinks";
import { defaultWebsiteContent } from "@/lib/websiteContentDefaults";

export const metadata: Metadata = {
  title: "About",
};

const staticAboutFallback = {
  heading: defaultAboutPageContent.heading,
  description: defaultAboutPageContent.description,
  aboutContent: defaultAboutPageContent.aboutContent,
  imageUrl: defaultAboutPageContent.imageUrl,
  featuresHeading:
    defaultWhyChooseUsContent.sectionHeading ?? "Why Choose EduPlatform",
  featuresSubtitle:
    defaultWhyChooseUsContent.sectionSubtitle ??
    "Everything you need to succeed in your learning journey.",
};

export default async function AboutPage() {
  const raw = await loadWebsiteContentSettings();
  const cmsData = raw as unknown as WebsiteContent;

  const aboutPage = {
    ...defaultAboutPageContent,
    ...(cmsData?.aboutPage ?? {}),
  };
  const whyChooseUs = {
    ...defaultWhyChooseUsContent,
    ...(cmsData?.whyChooseUs ?? {}),
  };
  const socialMedia = {
    ...defaultWebsiteContent.socialMedia,
    ...(cmsData?.socialMedia ?? {}),
  };

  const heading = aboutPage.heading?.trim() || staticAboutFallback.heading;
  const description =
    aboutPage.description?.trim() || staticAboutFallback.description;
  const aboutContent =
    aboutPage.aboutContent?.trim() || staticAboutFallback.aboutContent;
  const imageUrl = aboutPage.imageUrl?.trim() || staticAboutFallback.imageUrl;

  const featuresHeading =
    whyChooseUs.sectionHeading?.trim() || staticAboutFallback.featuresHeading;
  const featuresSubtitle =
    whyChooseUs.sectionSubtitle?.trim() || staticAboutFallback.featuresSubtitle;

  const features =
    whyChooseUs.features?.length > 0
      ? whyChooseUs.features.map((feature, index) => {
          const fallback = HOME_FEATURES[index % HOME_FEATURES.length];
          const iconMeta = FEATURE_ICON_BY_TYPE[feature.iconType] ?? {
            icon: fallback.icon,
            iconBg: fallback.iconBg,
          };
          return {
            icon: iconMeta.icon,
            iconBg: iconMeta.iconBg,
            title: feature.title || fallback.title,
            description: feature.description || fallback.body,
          };
        })
      : HOME_FEATURES.map((f) => ({
          icon: f.icon,
          iconBg: f.iconBg,
          title: f.title,
          description: f.body,
        }));

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

      <section className="border-t border-border bg-surface-container-low px-6 py-16 md:px-10">
        <div className="mb-12 max-w-2xl">
          <h2 className="font-[family-name:var(--font-headline)] text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            {featuresHeading}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{featuresSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                  feature.iconBg,
                )}
              >
                <span className="material-symbols-outlined text-2xl text-white">
                  {feature.icon}
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-headline)] text-base font-bold text-foreground sm:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
