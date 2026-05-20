import { cn } from "@/lib/cn";

type CourseCardSkeletonProps = {
  list?: boolean;
};

export function CourseCardSkeleton({ list = false }: CourseCardSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-surface-container p-4 shadow-md",
        list ? "flex flex-row items-center gap-4 md:gap-6" : "flex flex-col gap-4",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "shrink-0 rounded-lg bg-muted",
          list ? "h-32 w-42 md:h-52 md:w-68" : "h-56 w-full",
        )}
      />
      <div className={cn("flex flex-1 flex-col gap-3", list && "min-w-0")}>
        <div className="h-6 w-3/4 max-w-xs rounded-md bg-muted" />
        <div className="h-4 w-full rounded-md bg-muted/80" />
        <div className="h-4 w-5/6 rounded-md bg-muted/80" />
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-outline-variant/20 pt-3">
          <div className="h-8 w-20 rounded-md bg-muted" />
          <div className="h-4 w-24 rounded-md bg-muted/80" />
        </div>
        <div className="h-10 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}
