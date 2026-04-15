"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  addToCart,
  fetchCourseBundle,
  useAppDispatch,
  useAppSelector,
} from "@/store";

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
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
    router.push("/cart");
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
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
          {course.difficulty ?? "Course"}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {course.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {course.shortDescription}
        </p>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-foreground">
            Curriculum
          </h2>
          <div className="mt-6 space-y-8">
            {chapters.map((ch) => (
              <div key={ch._id}>
                <h3 className="text-lg font-bold text-primary">{ch.title}</h3>
                {ch.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {ch.description}
                  </p>
                ) : null}
                <ul className="mt-4 space-y-3 border-l-2 border-primary/30 pl-4">
                  {(lessonsByChapter.get(ch._id) ?? []).map((lesson) => (
                    <li
                      key={lesson._id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-foreground">{lesson.title}</span>
                      <span className="text-muted-foreground">
                        {lesson.duration ? `${lesson.duration} min` : ""}
                        {lesson.isFree ? " · Preview" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {faqs.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-foreground">
              FAQ
            </h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((f) => (
                <div key={f._id}>
                  <dt className="font-semibold text-foreground">{f.question}</dt>
                  <dd className="mt-2 text-muted-foreground">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-editorial">
          <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-surface-container-high" />
          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-3xl font-black text-primary">
              {course.isPaid ? `৳${course.finalPrice}` : "Free"}
            </span>
            {course.enrollmentCount ? (
              <span className="text-sm text-muted-foreground">
                {course.enrollmentCount} learners
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-6 w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-3.5 text-center font-bold text-on-primary shadow-lg shadow-blue-900/20 transition-transform active:scale-[0.99]"
          >
            {course.isPaid ? "Add to cart" : "Enroll free"}
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Checkout is mock-only until payment integration (Phase 10).
          </p>
        </div>
      </aside>
    </div>
  );
}
