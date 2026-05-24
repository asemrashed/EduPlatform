import { CourseCardSkeleton } from "./CourseCardSkeleton";

const CARD_COUNT = 8;

/** Hero + course grid; site nav comes from `SiteHeader` in the public layout. */
export function HomePageSkeleton() {
  return (
    <div className="bg-background text-foreground" role="status" aria-busy="true">
      <p className="sr-only">Loading homepage</p>

      {/* Hero */}
      <section className="animate-pulse bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-2">
          <div className="max-w-xl space-y-4">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-20 w-full max-w-sm rounded-lg bg-muted/80" />
            <div className="h-8 w-56 rounded-full bg-muted" />
            <div className="h-14 w-full rounded-lg bg-muted/80" />
            <div className="h-4 w-full rounded bg-muted/60" />
            <div className="h-4 w-5/6 rounded bg-muted/60" />
          </div>
          <div className="mx-auto h-80 w-full max-w-lg rounded-lg bg-muted/40" />
        </div>
        <div className="border-t border-outline-variant/20 bg-[#f0ebe3] px-6 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="h-4 w-full rounded bg-muted/60" />
              <div className="h-4 w-5/6 rounded bg-muted/60" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-full rounded bg-muted/60" />
              <div className="h-4 w-5/6 rounded bg-muted/60" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-muted" />
              <div className="h-5 w-full animate-pulse rounded-md bg-muted/80" />
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-muted/80" />
            </div>
            <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: CARD_COUNT }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
