import Link from "next/link";
import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  children: ReactNode;
  sideTitle: string;
  sideDescription: string;
};

/** Login.html — split editorial panel + form column (no top nav suppression; global shell retained). */
export function AuthSplitLayout({
  children,
  sideTitle,
  sideDescription,
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col lg:flex-row">
      <section className="relative hidden overflow-hidden lg:flex lg:w-1/2 lg:items-end lg:p-16">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/80 to-primary-container" />
        <div className="relative z-10 max-w-xl text-on-primary">
          <Link
            href="/"
            className="mb-8 inline-block text-sm font-semibold text-on-primary/90 hover:text-on-primary"
          >
            ← EduPlatform
          </Link>
          <h2 className="font-[family-name:var(--font-headline)] text-4xl font-black leading-tight">
            {sideTitle}
          </h2>
          <p className="mt-4 text-lg text-on-primary/90">{sideDescription}</p>
        </div>
      </section>
      <section className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
