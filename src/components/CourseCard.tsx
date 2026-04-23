'use client';

import { cn } from '@/lib/cn';
import Image from 'next/image';
import Link from 'next/link';
export default function CourseCard({ course, index }: { course: any, index: number }) {
  const rawHref = typeof course?.href === "string" ? course.href : "";
  const targetHref =
    rawHref.startsWith("/course/") || rawHref.startsWith("/courses")
      ? rawHref
      : rawHref.startsWith("/")
        ? `/course${rawHref}`
        : rawHref
          ? `/course/${rawHref}`
          : "/courses";

  return (
      <div
        key={index}
        className="flex flex-col justify-between gap-1 md:gap-2 rounded-lg bg-surface-container p-4 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/40"
      >
        <div className="relative h-56 overflow-hidden rounded-lg">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <span
            className={cn(
              "absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-tighter",
              course.badgeClass,
            )}
          >
            {course.badge}
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-foreground">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>
        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-2 md:pt-4">
          <span className="text-2xl font-black text-primary">
            {course.price}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <span className="material-symbols-outlined text-base">
              play_lesson
            </span>
            {course.lessons}
          </span>
        </div>
        <Link
          href={targetHref}
          className="w-full rounded-lg bg-primary py-4 text-center font-bold text-on-primary transition-transform active:scale-95"
        >
          Enroll Course
        </Link>
      </div>
  );
}
