import type { ReactNode } from "react";
import { ResourceTabBar } from "@/components/resources/ResourceTabBar";

export default function StudentResourcesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8">
      <header className="mb-4">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Resources
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Notes, topical worksheets, and self-test practice in one place.
        </p>
      </header>
      <ResourceTabBar />
      <div className="mt-6">{children}</div>
    </div>
  );
}
