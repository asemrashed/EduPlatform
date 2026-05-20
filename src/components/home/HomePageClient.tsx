"use client";

/**
 * HomePage.html — sections in order (main only; global header/footer in layout):
 * 1. Hero
 * 2. Stats
 * 3. Courses Designed for Success (6 cards)
 * 4. Features ("Powerful Features…")
 * 5. Meet Our Expert Mentors (4)
 * 6. Testimonials
 * 7. Partners
 * 8. FAQ
 *
 * Static copy + images from Frontend-design/HomePage.html (no API / no Redux).
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import banner from "@/public/banner.png";
import { fetchPublicCourses, useAppDispatch, useAppSelector } from "@/store";
import type { PublicCourseRow } from "@/types/public-course";
import type { WebsiteContent } from "@/lib/websiteContentDefaults";
import {
  HOME_FAQ,
  HOME_HERO,
  HOME_PARTNERS,
} from "@/data/homePageContent";
import CourseCard from "../CourseCard";
import ExpertsCarousel from "../carousals/ExpertsCarousel";
import Testimonials from "./Testimonials";
import FAQ from "./FAQ";
import type { CourseReview } from "@/types/course-review";
import { mapFeaturedReviewsToTestimonials } from "@/lib/mapFeaturedReviewsToTestimonials";
import type { FeaturedInstructor } from "@/types/featured-instructor";
import { HomeFeaturesSection } from "@/components/features/HomeFeaturesSection";
import { resolveFeaturesContent } from "@/lib/resolveFeaturesContent";

function joinTitleParts(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join("");
}

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
  const { publicList } = useAppSelector((s) => s.courses);

  const hero = cmsData?.hero;
  const heroTitleBefore = hero?.title?.part1 || HOME_HERO.titleBefore;
  const heroTitleAccent =
    joinTitleParts(hero?.title?.part2, hero?.title?.part3, hero?.title?.part4, hero?.title?.part5) ||
    HOME_HERO.titleAccent;
  const heroDescription = hero?.description || HOME_HERO.description;
  const heroCtaText = hero?.buttons?.primary?.text || "Join Now";
  const heroImage =
    hero?.carousel?.items?.[0]?.image || cmsData?.promotionalBanner?.imageUrl || banner.src;

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
    dispatch(fetchPublicCourses(undefined));
  }, [dispatch]);

  const featuredCourseIds = cmsData?.courses?.featuredCourseIds ?? [];
  const featuredCourses = useMemo(() => {
    const ordered =
      featuredCourseIds.length > 0
        ? featuredCourseIds
            .map((id) => publicList.find((c) => c._id === id))
            .filter((c): c is PublicCourseRow => Boolean(c))
        : publicList.slice(0, 8);

    return ordered.map((course) => ({
      href: `/${course._id}`,
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

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-container to-primary-container px-6 py-20 md:px-12 lg:px-20">

  <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:justify-between">

    {/* LEFT CONTENT */}
    <div className="max-w-xl text-center lg:text-left">
      
      <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
        {heroTitleBefore} 
        {" "}
        <span className="text-primary">
          {heroTitleAccent}
        </span>{" "}
        <br />
      </h1>

      <p className="mb-8 text-lg text-white/80">
        {heroDescription}
      </p>

      <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
        <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary shadow-lg hover:scale-105 transition">
          {heroCtaText}
        </button>
      </div>
    </div>

    {/* RIGHT IMAGE */}
    <div className="flex-1 relative w-full min-w-sm max-w-2xl rounded-xl">

      <div className="relative w-full overflow-hidden rounded-3xl p-6 backdrop-blur-xl">

        <img
          src={heroImage}
          alt="Hero"
          className="w-full object-contain rounded-xl"
        />

      </div>
    </div>

  </div>
</section>

      {/* Courses */}
      <section className="px-8 py-24">
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
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No courses to display yet. Check back soon or browse the full catalog.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredCourses.map((c, i) => (
                <CourseCard key={`${c.title}-${i}`} course={c as any} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <HomeFeaturesSection content={featuresContent} />

      {/* Experts */}
      {experts.length > 0 ? (
        <ExpertsCarousel
          experts={experts}
          badgeLabel={instructorsSection?.badgeLabel}
          sectionHeading={instructorsSection?.sectionHeading}
          sectionSubtitle={instructorsSection?.sectionSubtitle}
        />
      ) : null}

      {/* Testimonials */}
      <Testimonials items={testimonials} />

      {/* Partners */}
      <section className="bg-surface px-8 py-20">
        <div className="mx-auto mb-12 max-w-screen-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {partnersTitle}
          </p>
        </div>
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-10 transition-all md:gap-20">
          {partners.map((p) => {
            const inner = p.imageUrl ? (
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={150}
                height={70}
              />
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

  {/* FAQ */}
      <FAQ items={faqItems} />
      
    </div>
  );
}
