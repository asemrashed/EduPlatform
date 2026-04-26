"use client";

/**
 * AllCourse.html — structure:
 * - Hero (blue, bg image)
 * - Sidebar: categories + promo
 * - Main: Curated Courses, count, grid/list toggle
 * - Course grid 3 cols
 * - Pagination
 *
 * Data: Redux `fetchPublicCourses` + static rows from allCoursePageContent.ts
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPublicCourses, useAppDispatch, useAppSelector } from "@/store";
import type { PublicCourseRow } from "@/mock/publicCourses";
import {
  CATALOG_SIDEBAR,
  STATIC_CATALOG_CARDS,
  type CatalogSidebarItem,
  type CatalogCategoryId,
} from "@/data/allCoursePageContent";
import { cn } from "@/lib/cn";
import CourseCard from "@/components/CourseCard";

type ViewMode = "grid" | "list";

type DisplayCard = {
  key: string;
  href: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeClass: string;
  title: string;
  description: string;
  price: string;
  lessons: string;
  categoryId: CatalogCategoryId;
};

function inferCategoryFromCourse(c: PublicCourseRow): CatalogCategoryId {
  const t = (
    c.title +
    " " +
    (c.shortDescription ?? "") +
    " " +
    (c.tags?.join(" ") ?? "")
  ).toLowerCase();

  if (t.includes("web") || t.includes("frontend") || t.includes("backend")) {
    return "web-development";
  }
  if (t.includes("data science") || t.includes("machine learning") || t.includes("ai")) {
    return "data-science";
  }
  if (t.includes("design") || t.includes("ui") || t.includes("ux")) {
    return "design";
  }
  if (t.includes("cloud") || t.includes("aws") || t.includes("azure") || t.includes("devops")) {
    return "cloud-computing";
  }
  if (t.includes("mobile") || t.includes("android") || t.includes("ios") || t.includes("react native")) {
    return "mobile-development";
  }
  if (t.includes("marketing") || t.includes("seo") || t.includes("social media")) {
    return "marketing";
  }
  if (t.includes("database") || t.includes("sql") || t.includes("mongodb")) {
    return "databases";
  }
  if (t.includes("security") || t.includes("cyber")) {
    return "cybersecurity";
  }
  return "programming";
}

function mapReduxToDisplay(c: PublicCourseRow): DisplayCard {
  const categoryId = c.category
    ? normalizeCategoryId(String(c.category))
    : inferCategoryFromCourse(c);
  const badge =
    c.tags?.[0] ??
    (categoryId === "web-development"
      ? "Web Development"
      : categoryId === "data-science"
        ? "Data Science"
        : categoryId === "cloud-computing"
          ? "Cloud"
          : categoryId === "mobile-development"
            ? "Mobile Development"
            : categoryId === "cybersecurity"
              ? "Cybersecurity"
              : categoryId === "databases"
                ? "Databases"
                : categoryId === "marketing"
                  ? "Marketing"
                  : categoryId === "design"
                    ? "Design"
                    : "Programming");
  return {
    key: `redux-${c._id}`,
    href: `/${c._id}`,
    image:
      c.thumbnailUrl ||
      STATIC_CATALOG_CARDS[0]?.image ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcBZqvF9S4XJxbHTkXmH3f9S2nguKoBLsh0WNiXpxEKcPtiqm2q7u33HtkChEiGO1yVUXV3YX74chjCSR7svAuh4oufS4xwpXvso6_X2WA4QfIZCHg3IgoM6bQ7P7QwRhnpibyqv9DP-VXOg7dVeSLbJfdwKBqCB1LwPVssAmyNDTKfvPg1e0WHUS7a3iJ-I5pKEvulcBVK9uwaJPTg1WCGxtjm12MTH5a2FG47aMxv3kE2g3CNHutYA6O-VeQg6x7EDTIoXnqfvI",
    imageAlt: c.title,
    badge,
    badgeClass: "bg-primary text-on-primary",
    title: c.title,
    description: c.shortDescription ?? "",
    price: c.isPaid ? `৳${c.finalPrice ?? c.price ?? 0}` : "Free",
    lessons: `${c.lessonCount ?? 0}+ Lessons`,
    categoryId,
  };
}

function mapStaticToDisplay(
  s: (typeof STATIC_CATALOG_CARDS)[number],
  i: number,
): DisplayCard {
  return {
    key: `static-${i}-${s.title}`,
    href: "/courses",
    image: s.image,
    imageAlt: s.imageAlt,
    badge: s.badge,
    badgeClass: "bg-primary text-on-primary",
    title: s.title,
    description: s.description,
    price: s.price,
    lessons: s.lessons,
    categoryId: s.categoryId,
  };
}

const PAGE_SIZE = 6;

function normalizeCategoryId(value: string): CatalogCategoryId {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CoursesCatalogClient() {
  const dispatch = useAppDispatch();
  const { status, error, publicList } = useAppSelector((s) => s.courses);
  const useMockApi = useAppSelector((s) => s.ui.useMockApi);

  const [category, setCategory] = useState<CatalogCategoryId>("all");
  const [sidebarCategories, setSidebarCategories] =
    useState<CatalogSidebarItem[]>(CATALOG_SIDEBAR);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    dispatch(fetchPublicCourses(undefined));
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const loadSidebarCategories = async () => {
      try {
        const response = await fetch("/api/public/categories", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = await response.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        if (!payload?.success || rows.length === 0) return;

        const dynamicRows: CatalogSidebarItem[] = rows
          .map((row: any) => {
            const id = normalizeCategoryId(String(row?.id || ""));
            const label = String(row?.label || "").trim();
            const count = Number.isFinite(Number(row?.count))
              ? Number(row.count)
              : 0;
            if (!id || !label) return null;
            return { id, label, count };
          })
          .filter(Boolean) as CatalogSidebarItem[];

        if (cancelled || dynamicRows.length === 0) return;
        const total = dynamicRows.reduce((sum, row) => sum + row.count, 0);
        setSidebarCategories([
          { id: "all", label: "All", count: total },
          ...dynamicRows,
        ]);
      } catch {
        // Keep static sidebar fallback on API failure.
      }
    };

    loadSidebarCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const merged = useMemo(() => {
    const fromRedux = publicList.map(mapReduxToDisplay);
    const need = Math.max(0, 6 - fromRedux.length);
    const fromStatic = STATIC_CATALOG_CARDS.slice(0, need).map(mapStaticToDisplay);
    return [...fromRedux, ...fromStatic];
  }, [publicList]);

  const filtered = useMemo(() => {
    if (category === "all") return merged;
    return merged.filter((c) => c.categoryId === category);
  }, [merged, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [category, filtered.length]);

  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + PAGE_SIZE, filtered.length);

  if (status === "loading" || status === "idle") {
    return (
      <div className="pt-20" role="status" aria-busy="true">
        <p className="sr-only">Loading courses</p>
        <div className="h-[400px] animate-pulse bg-primary/30" />
        <div className="mx-auto max-w-screen-2xl px-8 py-20">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-screen-2xl px-8 py-20">
        <div
          className="rounded-xl border border-destructive/40 bg-gradient-to-br from-primary/20 to-primary-container"
          role="alert"
        >
          <p className="font-semibold">Could not load courses</p>
          <p className="mt-2 text-sm">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            onClick={() => dispatch(fetchPublicCourses(undefined))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-foreground">
      {/* Hero — AllCourse.html */}
      <section className="relative flex h-[400px] items-center overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA49z5j8dNSWa9xyciQauqnApJ20f5WiqAAFt1WC0qJnfhMUz2PJC4u1-22QUWy7ne00W-7hNpWway3iinbaoTxzGVBdugweY_nGDoBhF9xnkL1QPXKw4AlJGLV35u6rQx1eW8GM9DaUFs5Zbl81chOkgg2lD0Fbct348O1Tyr3jCw1xpW7NDWRVmnI2cxsDNVGAeYALh7qYZ3FGBDKOoso9_EjggIWuvXSzy2uRtrm3XaWNlqGjaMQvFd3YkTCU4iLY_xewch068Y"
            alt=""
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-container"/>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-8">
          <div className="max-w-2xl">
            <span className="mb-4 block font-[family-name:var(--font-headline)] text-sm font-bold uppercase tracking-[0.2em] text-primary-container">
              Curated Knowledge
            </span>
            <h1 className="font-[family-name:var(--font-headline)] text-6xl font-black leading-[1.1] tracking-tight text-white md:text-7xl">
              All Courses
            </h1>
            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-on-primary-container opacity-90">
              Explore our elite collection of academic programs, designed by
              world-class faculty to shape the next generation of leadership.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-8 py-20 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-64">
          <div className="sticky top-28 space-y-10">
            <div>
              <h3 className="mb-6 font-[family-name:var(--font-headline)] text-xs font-black uppercase tracking-[0.2em] text-outline">
                Filter by Category
              </h3>
              <ul className="space-y-1">
                {sidebarCategories.map((row) => {
                  const active = category === row.id;
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setCategory(row.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-5 py-3.5 font-bold transition-all",
                          active
                            ? "bg-primary text-white shadow-lg shadow-blue-900/10"
                            : "font-semibold text-muted-foreground transition-all hover:bg-surface-container-high",
                        )}
                      >
                        <span>{row.label}</span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px]",
                            active ? "bg-white/20" : "bg-surface-container-highest",
                          )}
                        >
                          {row.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6">
              <h3 className="mb-4 text-sm font-bold">Enrollment Special</h3>
              <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                Get 20% off on all Admission courses this semester.
              </p>
              <button
                type="button"
                className="text-xs font-bold uppercase tracking-wider text-secondary hover:underline"
              >
                View Offers
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-grow">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="font-[family-name:var(--font-headline)] text-4xl font-black tracking-tight text-foreground">
                Curated Courses
              </h2>
              <p className="mt-2 font-medium text-muted-foreground">
                Showing {showingFrom}-{showingTo} of {filtered.length} courses
                {useMockApi ? " · mock catalog" : ""}
              </p>
            </div>
            <div className="hidden items-center gap-4 rounded-full bg-surface-container-low p-1.5 md:flex">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-full p-2.5 transition-colors",
                  view === "grid"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-surface-container-highest",
                )}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined block text-sm">
                  grid_view
                </span>
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-full p-2.5 transition-colors",
                  view === "list"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-surface-container-highest",
                )}
                aria-label="List view"
              >
                <span className="material-symbols-outlined block text-sm">
                  format_list_bulleted
                </span>
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No courses in this category.
            </p>
          ) : (
            <ul
              className={cn(
                view === "grid"
                  ? "grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                  : "flex flex-col gap-6",
              )}
            >
              {pageRows.map((c, i) => 
                <CourseCard key={i} course={c as any} index={i} />
              )}
            </ul>
          )}

          {/* Pagination — AllCourse.html styled controls */}
          {filtered.length > 0 ? (
            <div className="mt-20 flex items-center justify-center gap-3">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground shadow-sm transition-all hover:bg-primary hover:text-white disabled:opacity-40"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full font-bold transition-all",
                    n === pageSafe
                      ? "bg-primary text-white shadow-xl shadow-blue-900/20"
                      : "bg-surface-container-low text-muted-foreground hover:bg-primary hover:text-white",
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-muted-foreground shadow-sm transition-all hover:bg-primary hover:text-white disabled:opacity-40"
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
