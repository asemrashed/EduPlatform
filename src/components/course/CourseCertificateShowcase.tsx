"use client";

import { LuAward, LuCircleCheck } from "react-icons/lu";

type CourseCertificateShowcaseProps = {
  courseTitle: string;
  outcomes?: string[];
};

/**
 * Marketing preview of the completion certificate (course name only — no student name).
 */
export function CourseCertificateShowcase({
  courseTitle,
  outcomes = [],
}: CourseCertificateShowcaseProps) {
  const visibleOutcomes = outcomes
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter(Boolean);

  return (
    <section
      id="certificate"
      className="scroll-mt-[140px] md:scroll-mt-[160px] mt-12"
      aria-labelledby="course-certificate-heading"
    >
      <h2
        id="course-certificate-heading"
        className="font-headline text-2xl font-bold text-foreground mb-2"
      >
        Certificate of Completion
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Complete this course to earn a certificate recognizing your achievement.
      </p>

      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-surface via-card to-primary-container/10 p-6 md:p-8 shadow-editorial">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-xl border border-border/40 bg-white px-6 py-10 text-center shadow-sm">
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-secondary/90"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
              aria-hidden
            />
            <div className="relative z-[1] flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <LuAward className="h-6 w-6" aria-hidden />
              </div>
              <p className="text-sm text-muted-foreground">Certificate awarded for</p>
              <p className="font-headline text-2xl font-extrabold leading-tight text-foreground md:text-3xl">
                {courseTitle}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                EduPlatform · Certificate of Completion
              </p>
            </div>
            <div
              className="absolute right-8 top-1/2 z-[2] flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-2xl font-bold text-white shadow-md"
              aria-hidden
            >
              ✓
            </div>
          </div>

          {visibleOutcomes.length > 0 && (
            <div className="mt-6 rounded-lg border border-border/40 bg-card/80 p-5">
              <p className="mb-3 text-sm font-semibold text-foreground">
                This certificate recognizes that the learner has achieved:
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {visibleOutcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <LuCircleCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
