import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
};

/** Minimal placeholder — static copy only (no API). */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-screen-lg px-8 py-20">
      <h1 className="font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight text-foreground">
        Contact
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We&apos;re building the full contact workflow with Phase 8+ integrations. For
        now, reach out through your institutional coordinator or use the newsletter
        in the site footer.
      </p>
      <div className="mt-12 rounded-2xl border border-border bg-card p-8 shadow-editorial">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          EduPlatform
        </p>
        <p className="mt-4 text-muted-foreground">
          Dhaka, Bangladesh · support@eduplatform.example
        </p>
        <Link
          href="/courses"
          className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 font-bold text-on-primary"
        >
          Browse courses
        </Link>
      </div>
    </div>
  );
}
