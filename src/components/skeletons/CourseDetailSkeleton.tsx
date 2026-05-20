export function CourseDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-screen-2xl px-8 py-16"
      role="status"
      aria-busy="true"
    >
      <p className="sr-only">Loading course details</p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="animate-pulse space-y-8 lg:col-span-8">
          <div className="h-4 w-24 rounded-md bg-muted" />
          <div className="h-12 w-full max-w-2xl rounded-lg bg-muted" />
          <div className="h-5 w-full max-w-xl rounded-md bg-muted/80" />
          <div className="h-5 w-4/5 max-w-lg rounded-md bg-muted/80" />

          <div className="flex gap-6 border-b border-border/40 pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-20 rounded-md bg-muted" />
            ))}
          </div>

          <div className="space-y-4">
            <div className="h-8 w-48 rounded-lg bg-muted" />
            <div className="h-4 w-full rounded-md bg-muted/80" />
            <div className="h-4 w-full rounded-md bg-muted/80" />
            <div className="h-4 w-5/6 rounded-md bg-muted/80" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-20 rounded-md bg-muted/60" />
            ))}
          </div>

          <div className="h-64 rounded-xl bg-muted/50" />
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-28 animate-pulse rounded-2xl border border-border bg-card p-6 shadow-editorial">
            <div className="h-56 rounded-lg bg-muted" />
            <div className="mt-6 h-10 w-32 rounded-md bg-muted" />
            <div className="mt-4 h-11 w-full rounded-lg bg-muted/80" />
            <div className="mt-3 h-11 w-full rounded-lg bg-muted/80" />
          </div>
        </aside>
      </div>
    </div>
  );
}
