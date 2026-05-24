"use client";

/**
 * Home page sections (hero → FAQ) ordered by CMS `sectionOrder`.
 * Header/footer are in the public layout — not controlled here.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { fetchPublicCourses, useAppDispatch, useAppSelector } from "@/store";
import type { PublicCourseRow } from "@/types/public-course";
import type { WebsiteContent } from "@/lib/websiteContentDefaults";
import { HOME_FAQ, HOME_PARTNERS } from "@/data/homePageContent";
import { resolveHomeHeroContent } from "@/lib/resolveHomeHeroContent";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import CourseCard from "../CourseCard";
import ExpertsCarousel from "../carousals/ExpertsCarousel";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import type { CourseReview } from "@/types/course-review";
import { mapFeaturedReviewsToTestimonials } from "@/lib/mapFeaturedReviewsToTestimonials";
import type { FeaturedInstructor } from "@/types/featured-instructor";
import { HomeFeaturesSection } from "@/components/features/HomeFeaturesSection";
import { HomeStatisticsSection } from "@/components/home/HomeStatisticsSection";
import { resolveFeaturesContent } from "@/lib/resolveFeaturesContent";
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton";
import { resolveHomeSectionOrder } from "@/lib/homeSectionOrder";
import type { SectionId } from "@/lib/websiteContentTypes";

type HomePageClientProps = {
  cmsData: WebsiteContent | null;
  featuredReviews?: CourseReview[];
  featuredInstructors?: FeaturedInstructor[];
};

export function HomePageClient({
  cmsData,
  featuredReviews = [],
  featuredInstructors = [],
}: HomePageClientProps) {
  const dispatch = useAppDispatch();
  const { publicList, status: coursesStatus } = useAppSelector((s) => s.courses);
  const isCatalogInitialLoad =
    (coursesStatus === "idle" || coursesStatus === "loading") &&
    publicList.length === 0;

  const heroContent = useMemo(
    () => resolveHomeHeroContent(cmsData),
    [cmsData],
  );

  const promo = cmsData?.promotionalBanner;
  const coursesTitle = promo?.headline || "Courses Designed for Success";
  const coursesDescription =
    promo?.subtext ||
    "Curated paths focusing on high-impact skills that the global market demands today..";
  const coursesCtaLabel = promo?.ctaLabel || "View all";
  const coursesCtaHref = promo?.link || "/courses";

  const instructorsSection = cmsData?.homeInstructors;
  const experts = useMemo(
    () =>
      featuredInstructors.map((i) => ({
        id: i.id,
        name: i.name,
        role: i.roleLine,
        image: i.image,
        experience: i.experience,
      })),
    [featuredInstructors],
  );

  const testimonials = useMemo(
    () => mapFeaturedReviewsToTestimonials(featuredReviews),
    [featuredReviews],
  );

  const partnersTitle =
    cmsData?.partners?.title?.trim() || "Our Trusted Partners & Integrations";

  const partners = useMemo(() => {
    const items = cmsData?.partners?.items?.filter((item) => item.name?.trim());
    if (items && items.length > 0) {
      return items.map((item) => ({
        name: item.name.trim(),
        imageUrl: item.imageUrl?.trim() || "",
        href: item.href?.trim() || "",
      }));
    }
    const legacy = cmsData?.footer?.paymentGateway?.methods;
    if (legacy?.length) {
      return legacy.map((name) => ({ name, imageUrl: "", href: "" }));
    }
    return HOME_PARTNERS.map((name) => ({ name, imageUrl: "", href: "" }));
  }, [cmsData?.partners?.items, cmsData?.footer?.paymentGateway?.methods]);

  const featuresContent = useMemo(
    () => resolveFeaturesContent(cmsData),
    [cmsData],
  );

  const faqItems = useMemo(() => {
    const faqs = cmsData?.faq?.faqs;
    if (faqs?.length) {
      return faqs.map((item) => ({
        q: item.question,
        a: item.answer,
      }));
    }
    return [...HOME_FAQ];
  }, [cmsData?.faq?.faqs]);

  useEffect(() => {
    if (coursesStatus === "idle") {
      dispatch(fetchPublicCourses(undefined));
    }
  }, [dispatch, coursesStatus]);

  const featuredCourseIds = cmsData?.courses?.featuredCourseIds ?? [];
  const featuredCourses = useMemo(() => {
    const maxCards = 4;
    const byId = new Map(publicList.map((c) => [String(c._id), c]));
    const pickedIds = new Set<string>();
    const ordered: PublicCourseRow[] = [];

    if (featuredCourseIds.length > 0) {
      for (const id of featuredCourseIds) {
        const course = byId.get(String(id));
        if (course && !pickedIds.has(String(course._id))) {
          pickedIds.add(String(course._id));
          ordered.push(course);
        }
      }
      for (const course of publicList) {
        if (ordered.length >= maxCards) break;
        const courseId = String(course._id);
        if (!pickedIds.has(courseId)) {
          pickedIds.add(courseId);
          ordered.push(course);
        }
      }
    } else {
      ordered.push(...publicList.slice(0, maxCards));
    }

    return ordered.map((course) => ({
      href: `/course/${course._id}`,
      image: course.thumbnailUrl || "",
      imageAlt: course.title,
      badge: course.tags?.[0] || (course.isPaid ? "Premium" : "Free"),
      badgeClass: "bg-primary text-on-primary",
      title: course.title,
      description:
        course.shortDescription || course.description || "Explore this course.",
      price: course.isPaid ? `${course.finalPrice ?? course.price ?? 0}` : "Free",
      lessons: `${course.lessonCount ?? 0}+ Lessons`,
    }));
  }, [publicList, featuredCourseIds]);

  const enabledSections = useMemo(
    () =>
      resolveHomeSectionOrder(cmsData?.sectionOrder).filter(
        (section) => section.enabled,
      ),
    [cmsData?.sectionOrder],
  );

  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case "hero":
        return <HomeHeroSection key="hero" content={heroContent} />;
      case "statistics":
        return (
          <HomeStatisticsSection
            key="statistics"
            content={cmsData?.statistics}
          />
        );
      case "courses":
        return (
          <section key="courses" className="px-8 py-24">
            <div className="mx-auto max-w-screen-2xl">
              <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
                <div className="max-w-2xl">
                  <h2 className="mb-4 font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground">
                    {coursesTitle}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {coursesDescription}
                  </p>
                </div>
                <Link
                  href={coursesCtaHref}
                  className="flex items-center gap-2 font-bold text-primary hover:underline hover:underline-offset-8"
                >
                  {coursesCtaLabel}
                  <span className="material-symbols-outlined">north_east</span>
                </Link>
              </div>
              {featuredCourses.length === 0 ? (
                coursesStatus === "failed" ? (
                  <p className="rounded-xl border border-dashed border-destructive/40 p-12 text-center text-muted-foreground">
                    Could not load courses. Please refresh the page.
                  </p>
                ) : (
                  <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    No courses to display yet. Check back soon or browse the full catalog.
                  </p>
                )
              ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {featuredCourses.map((c, i) => (
                    <CourseCard key={`${c.title}-${i}`} course={c as any} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      case "features":
        return <HomeFeaturesSection key="features" content={featuresContent} />;
      case "instructors":
        return experts.length > 0 ? (
          <ExpertsCarousel
            key="instructors"
            experts={experts}
            badgeLabel={instructorsSection?.badgeLabel}
            sectionHeading={instructorsSection?.sectionHeading}
            sectionSubtitle={instructorsSection?.sectionSubtitle}
          />
        ) : null;
      case "testimonials":
        return <Testimonials key="testimonials" items={testimonials} />;
      case "partners":
        return (
          <section key="partners" className="bg-surface px-8 py-20">
            <div className="mx-auto mb-12 max-w-screen-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {partnersTitle}
              </p>
            </div>
            <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-10 transition-all md:gap-20">
              {partners.map((p) => {
                const inner = p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} width={150} height={70} />
                ) : (
                  <span
                    className={cn(
                      "text-3xl font-black text-foreground",
                      p.name === "Zoom" && "italic",
                    )}
                  >
                    {p.name}
                  </span>
                );
                const key = `${p.name}-${p.imageUrl}-${p.href}`;
                if (p.href) {
                  return (
                    <Link
                      key={key}
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <span key={key} className="inline-flex">
                    {inner}
                  </span>
                );
              })}
            </div>
          </section>
        );
      case "faq":
        return <FAQ key="faq" items={faqItems} />;
      default:
        return null;
    }
  };

  if (isCatalogInitialLoad) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="bg-background text-foreground">
      {enabledSections.map((section) => renderSection(section.id))}
    </div>
  );
}
