"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { RESOURCE_TABS, isResourcePublicPath } from "@/lib/resources/config";

type ResourcesNavDropdownProps = {
  pathname: string;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function ResourcesNavDropdown({
  pathname,
  variant,
  onNavigate,
}: ResourcesNavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = isResourcePublicPath(pathname);

  useEffect(() => {
    if (variant !== "desktop") return;
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [variant]);

  if (variant === "mobile") {
    return (
      <div className="rounded-lg">
        <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Resources
        </p>
        {RESOURCE_TABS.map((tab) => {
          const itemActive = pathname === tab.publicHref;
          return (
            <Link
              key={tab.id}
              href={tab.publicHref}
              onClick={onNavigate}
              className={cn(
                "block rounded-lg px-3 py-3 text-sm pl-6",
                itemActive
                  ? "bg-surface-container text-primary"
                  : "hover:bg-surface-container",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "border-b-2 py-1 text-sm font-semibold inline-flex items-center gap-1",
          active
            ? "border-primary text-primary"
            : "border-transparent text-muted-foreground hover:text-primary",
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Resources
        <span className="text-xs" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-border bg-white shadow-lg">
          {RESOURCE_TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.publicHref}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={cn(
                "block px-4 py-2.5 text-sm hover:bg-gray-100",
                pathname === tab.publicHref && "bg-surface-container text-primary font-semibold",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
