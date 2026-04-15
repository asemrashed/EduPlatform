import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
};

/** AboutUs.html — narrative + mission; static copy (Phase 3). CMS can follow in later phases. */
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-8 py-16">
      <section className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            Who we are
          </span>
          <h1 className="mt-4 font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            The digital curator of elite knowledge
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            EduPlatform brings together expert instructors, rigorous curricula, and
            a learner-first experience — aligned with our product vision and the
            design language in Frontend-design/AboutUs.html.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            We focus on high-impact skills for Bangladesh and global markets, with
            transparent pricing and pathways that respect your time.
          </p>
        </div>
        <div className="h-80 rounded-2xl bg-gradient-to-br from-surface-container-high to-primary/10 shadow-editorial lg:col-span-5" />
      </section>

      <section className="mt-24 grid gap-12 md:grid-cols-3">
        {[
          {
            title: "Curation",
            body: "Courses are reviewed for clarity, outcomes, and instructional quality.",
          },
          {
            title: "Community",
            body: "Learners and instructors share feedback to keep content current.",
          },
          {
            title: "Integrity",
            body: "Clear policies and support — no hidden fees in mock checkout flows.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-border bg-card p-8 shadow-editorial"
          >
            <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-primary">
              {card.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{card.body}</p>
          </div>
        ))}
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/courses"
          className="inline-flex rounded-xl bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-bold text-on-primary shadow-lg"
        >
          Explore courses
        </Link>
      </div>
    </div>
  );
}
