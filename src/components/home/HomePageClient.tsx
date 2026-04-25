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
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import banner from "@/public/banner.png";
import { fetchPublicCourses, useAppDispatch, useAppSelector } from "@/store";
import type { PublicCourseRow } from "@/mock/publicCourses";
import {
  HOME_EXPERTS,
  HOME_FAQ,
  HOME_FEATURES,
  HOME_FEATURES_IMAGE,
  HOME_FEATURED_COURSES,
  HOME_HERO,
  HOME_PARTNERS,
  HOME_STATS,
  HOME_TESTIMONIALS,
} from "@/data/homePageContent";
import CourseCard from "../CourseCard";
import ExpertsCarousel from "../carousals/ExpertsCarousel";


export function HomePageClient() {
  const dispatch = useAppDispatch();
  const { publicList } = useAppSelector((s) => s.courses);
  const [openFaq, setOpenFaq] = useState<number | null>(1);

  useEffect(() => {
    dispatch(fetchPublicCourses(undefined));
  }, [dispatch]);

  const featuredCourses = useMemo(() => {
    const fromApi = publicList.slice(0, 8).map((course: PublicCourseRow, i) => ({
      href: `/${course._id}`,
      image: course.thumbnailUrl || HOME_FEATURED_COURSES[i % HOME_FEATURED_COURSES.length]?.image,
      imageAlt: course.title,
      badge: course.tags?.[0] || (course.isPaid ? "Premium" : "Free"),
      badgeClass: "bg-primary text-on-primary",
      title: course.title,
      description: course.shortDescription || course.description || "Explore this course.",
      price: course.isPaid ? `$${course.finalPrice ?? course.price ?? 0}` : "Free",
      lessons: `${course.lessonCount ?? 0}+ Lessons`,
    }));

    return fromApi.length > 0 ? fromApi : HOME_FEATURED_COURSES;
  }, [publicList]);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-container to-primary-container px-6 py-20 md:px-12 lg:px-20">

  <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:justify-between">

    {/* LEFT CONTENT */}
    <div className="max-w-xl text-center lg:text-left">
      
      <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
        {HOME_HERO.titleBefore} 
        {" "}
        <span className="text-primary">
          {HOME_HERO.titleAccent}
        </span>{" "}
        <br />
      </h1>

      <p className="mb-8 text-lg text-white/80">
        {HOME_HERO.description}
      </p>

      <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
        <button className="rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary shadow-lg hover:scale-105 transition">
          Join Now
        </button>
      </div>
    </div>

    {/* RIGHT IMAGE */}
    <div className="relative w-full max-w-md">

      <div className="relative w-full overflow-hidden rounded-3xl p-6 backdrop-blur-xl">

        <img
          src={banner.src}
          alt="Hero"
          className="w-full object-contain"
        />

      </div>
    </div>

  </div>
</section>

      {/* Stats */}
      <section className="bg-surface-container-low py-16">
        <div className="mx-auto max-w-screen-2xl px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {HOME_STATS.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "text-center",
                  i < 3 && "md:border-r md:border-outline-variant/30",
                )}
              >
                <h3 className="mb-2 text-4xl font-black text-primary">{s.value}</h3>
                <p className="font-semibold text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="mb-4 font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground">
                Courses Designed for Success
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Curated paths focusing on high-impact skills that the global market
                demands today..
              </p>
            </div>
            <Link
              href="/courses"
              className="flex items-center gap-2 font-bold text-primary hover:underline hover:underline-offset-8"
            >
              View all
              <span className="material-symbols-outlined">north_east</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredCourses.map((c, i) => (
              <CourseCard key={`${c.title}-${i}`} course={c as any} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="overflow-hidden bg-surface-container-low px-8 py-24"
      >
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-blue-100 opacity-50 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border-8 border-white shadow-2xl">
              <div className="relative aspect-square w-full">
                <Image
                  src={HOME_FEATURES_IMAGE}
                  alt="Student Learning"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mb-8 font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground">
              Powerful Features for an Elite Experience
            </h2>
            <p className="mb-12 text-lg leading-relaxed text-muted-foreground">
              Our platform isn&apos;t just about video lessons; it&apos;s a complete
              ecosystem designed to facilitate mastery and networking.
            </p>
            <div className="space-y-8">
              {HOME_FEATURES.map((f) => (
                <div key={f.title} className="flex gap-6">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                      f.iconBg,
                    )}
                  >
                    <span className="material-symbols-outlined text-3xl text-white">
                      {f.icon}
                    </span>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xl font-bold text-foreground">
                      {f.title}
                    </h4>
                    <p className="text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Experts */}
      {/* <section className="px-8 py-24">
        <div className="mx-auto mb-16 max-w-screen-2xl text-center">
          <span className="mb-4 inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-800">
            Our Mentors
          </span>
          <h2 className="mb-4 font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground">
            Meet Our Expert Mentors
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Learn from the best in the industry—our mentors bring years of
            experience, knowledge, and passion to guide you on your learning journey.
          </p>
        </div>
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME_EXPERTS.map((ex) => (
            <div key={ex.name} className="group">
              <div className="mb-4 aspect-[1/1.2] overflow-hidden rounded-3xl border border-outline-variant/30">
                <div className="relative h-full w-full">
                  <Image
                    src={ex.image}
                    alt={ex.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                </div>
              </div>
              <div className="px-2">
                <h4 className="mb-0.5 text-xl font-extrabold text-foreground">
                  {ex.name}
                </h4>
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  {ex.role}
                </p>
                <div className="flex items-center">
                  <span className="material-symbols-outlined cursor-pointer text-lg text-muted-foreground transition-colors hover:text-primary">
                    public
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section> */}
      <ExpertsCarousel experts={HOME_EXPERTS} />

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-primary-container to-secondary-container px-8 py-24 text-on-primary">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="mb-6 font-[family-name:var(--font-headline)] text-5xl font-extrabold text-primary tracking-tight">
              What Our Learners Are Saying
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-primary/60">
              Join a community of high-achievers who have transformed their careers
              through EduPlatform.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-on-primary/30 transition-colors hover:bg-on-primary/10"
                aria-label="Previous testimonial"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-on-primary/30 text-on-primary transition-colors hover:bg-on-primary/10"
                aria-label="Next testimonial"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-8 ">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {HOME_TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="rounded-3xl border border-on-primary/20 bg-on-primary/10 p-8 backdrop-blur"
                >
                  <span
                    className="material-symbols-outlined mb-6 text-4xl text-secondary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    format_quote
                  </span>
                  <p className="mb-8 text-xl italic leading-relaxed">{t.quote}</p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h5 className="font-bold">{t.name}</h5>
                      <p className="text-sm text-on-primary/70">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="bg-surface px-8 py-20">
        <div className="mx-auto mb-12 max-w-screen-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Our Trusted Partners & Integrations
          </p>
        </div>
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0 md:gap-24">
          {HOME_PARTNERS.map((p) => (
            <span
              key={p}
              className={cn(
                "text-3xl font-black text-foreground",
                p === "Zoom" && "italic",
              )}
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-8 py-24">
        <h2 className="mb-16 text-center font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {HOME_FAQ.map((item, i) => {
            const open = openFaq === i;
            const expandable = Boolean(item.a);
            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-2xl bg-surface-container",
                  open && expandable && "border-2 border-primary/20",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-8 py-6 text-left transition-colors",
                    expandable && (open ? "bg-surface-container-high" : "hover:bg-surface-container-high"),
                    !expandable && "cursor-default hover:bg-surface-container-high/50",
                  )}
                  onClick={() => {
                    if (!expandable) return;
                    setOpenFaq(open ? null : i);
                  }}
                >
                  <span className="text-lg font-bold text-foreground">{item.q}</span>
                  <span className="material-symbols-outlined text-primary">
                    {expandable && open ? "remove" : "add"}
                  </span>
                </button>
                {open && expandable && item.a ? (
                  <div className="px-8 pb-8 leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
