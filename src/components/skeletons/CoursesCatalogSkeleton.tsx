import { CourseCardSkeleton } from "./CourseCardSkeleton";

export function CoursesCatalogSkeleton() {
  return (
    <div className="text-foreground" role="status" aria-busy="true">
      <p className="sr-only">Loading courses catalog</p>

      <section className="relative h-100 animate-pulse bg-primary/40">
        <div className="relative z-10 mx-auto flex h-full max-w-screen-2xl items-center px-8">
          <div className="max-w-2xl space-y-4">
            <div className="h-4 w-32 rounded-md bg-white/30" />
            <div className="h-14 w-80 max-w-full rounded-lg bg-white/25" />
            <div className="h-5 w-full max-w-lg rounded-md bg-white/20" />
            <div className="h-5 w-4/5 max-w-md rounded-md bg-white/20" />
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-8 py-20 md:flex-row">
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-28 animate-pulse space-y-4">
            <div className="h-4 w-40 rounded-md bg-muted" />
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-muted/80" />
            ))}
            <div className="mt-8 h-40 rounded-2xl bg-muted/60" />
          </div>
        </aside>
        <div className="min-w-0 flex-grow">
          <div className="mb-12 h-10 w-64 animate-pulse rounded-lg bg-muted" />
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
