import { CourseCardSkeleton } from "./CourseCardSkeleton";

const CARD_COUNT = 8;

/** Hero + course grid; site nav comes from `SiteHeader` in the public layout. */
export function HomePageSkeleton() {
  return (
    <div className="bg-background text-foreground" role="status" aria-busy="true">
      <p className="sr-only">Loading homepage</p>

      {/* Hero */}
      <section className="animate-pulse bg-gradient-to-br from-secondary-container/80 to-primary-container/80 px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:justify-between">
          <div className="w-full max-w-xl space-y-6 text-center lg:text-left">
            <div className="mx-auto h-12 w-full max-w-lg rounded-lg bg-white/20 lg:mx-0" />
            <div className="mx-auto h-12 w-4/5 max-w-md rounded-lg bg-white/15 lg:mx-0" />
            <div className="mx-auto h-5 w-full max-w-sm rounded-md bg-white/10 lg:mx-0" />
            <div className="mx-auto h-5 w-5/6 max-w-md rounded-md bg-white/10 lg:mx-0" />
            <div className="mx-auto h-12 w-32 rounded-lg bg-white/25 lg:mx-0" />
          </div>
          <div className="h-64 w-full max-w-2xl rounded-3xl bg-white/15 lg:h-80" />
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
