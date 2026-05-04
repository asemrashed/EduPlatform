"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import {
  addToCart,
  fetchCourseBundle,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import CourseCurriculum from "./CourseCurriculum";
import Image from "next/image";
import CourseFAQ from "./CourseFAQ";
import PrimaryActionBtn from "@/components/ui/buttons/PrimaryActionBtn";
import PrimaryOutLineBtn from "@/components/ui/buttons/PrimaryOutLineBtn";
import { useCheckout } from "@/hooks/useCheckout";

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const dispatch = useAppDispatch();
  const { handleCheckout } = useCheckout();
  const { status, error, course, chapters, lessons, faqs } = useAppSelector(
    (s) => s.courseDetail,
  );
  
  useEffect(() => {
    dispatch(fetchCourseBundle(courseId));
  }, [dispatch, courseId]);

  const lessonsByChapter = useMemo(() => {
    const map = new Map<string, typeof lessons>();
    for (const ch of chapters) {
      map.set(
        ch._id,
        lessons
          .filter((l) => l.chapter === ch._id)
          .sort((a, b) => a.order - b.order),
      );
    }
    return map;
  }, [chapters, lessons]);

  const handleAddToCart = () => {
    if (!course) return;
    dispatch(
      addToCart({
        courseId: course._id,
        title: course.title,
        finalPrice: course.finalPrice,
        isPaid: course.isPaid,
      }),
    );
    // router.push("/cart");
  };

  if (status === "loading" || status === "idle") {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <p className="sr-only">Loading course</p>
        <div className="h-12 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="rounded-xl border border-destructive/40 bg-error-container/40 p-8 text-on-error-container"
        role="alert"
      >
        <p className="font-semibold">Could not load this course</p>
        <p className="mt-2 text-sm">{error}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            onClick={() => dispatch(fetchCourseBundle(courseId))}
          >
            Retry
          </button>
          <Link
            href="/courses"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
          >
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-8"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold text-foreground">Course not found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This course may be unavailable right now.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-block rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
          {course.difficulty ?? "Course"}
        </p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {course.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {course.shortDescription}
        </p>
  {/* CURRICULUM sections */}
        <section className="mt-12">
          <h2 className="font-headline text-2xl font-bold text-foreground">
            Curriculum
          </h2>
          {chapters.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Detailed curriculum will appear once chapter/lesson public APIs are
              connected.
            </p>
          ) : (
            <div className="mt-6 space-y-8">
          {chapters.map((chapter, index) => {
            return (
              <CourseCurriculum
                key={chapter._id}
                chapter={chapter}
                lessons={lessonsByChapter.get(chapter._id) ?? []}
                courseId={courseId}
                isFirst={index === 0} 
              />
            );
          })}
            </div>
          )}
        </section>

{/* FAQ sections */}
        {faqs.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-headline text-2xl font-bold text-foreground">
              FAQ
            </h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((f,i) => (
                <CourseFAQ key={i} q={f.question} a={f.answer} courseId={courseId} />
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-editorial">
          <div className="relative h-56 overflow-hidden rounded-lg">
            <Image src={course.thumbnailUrl as string} alt={course.title} width={600} height={300} className="object-cover" />
          </div>
          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-2xl md:text-3xl font-black text-primary">
              <span className='text-3xl md:text-4xl mr-1'>৳</span>
              {course.isPaid ? `${course.finalPrice}` : "Free"}
            </span>
            {course.enrollmentCount ? (
              <span className="text-sm text-muted-foreground">
                {course.enrollmentCount} learners
              </span>
            ) : null}
          </div>
          <PrimaryOutLineBtn value="Enroll Now" handleBtn={() => handleCheckout(course._id)} />
          <PrimaryActionBtn value={course.isPaid ? "Add to Cart" : "Enroll Now"} handleBtn={handleAddToCart} />
        </div>
      </aside>
    </div>
  );
}
