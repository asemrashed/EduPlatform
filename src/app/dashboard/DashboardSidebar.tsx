"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { LuLogOut, LuSettings } from "react-icons/lu";
import { useAppSelector } from "@/store/hooks";
import type { DashboardRole } from "@/types/dashboard";
import {
  getDashboardSidebarNavForPath,
  type SidebarNavCategory,
} from "./dashboardSidebarNav";

function getUserInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isNavActive(pathname: string, href: string) {
  if (href === "#") return false;
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (
    href === "/student/dashboard" ||
    href === "/instructor/dashboard" ||
    href === "/admin/dashboard"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navButtonClasses(
  role: DashboardRole,
  active: boolean,
): { wrap: string; icon: string; label: string; glow: string; dot: string } {
  if (role === "student") {
    return {
      wrap: `group relative block cursor-pointer rounded-lg px-3 py-3 transition-all duration-200 ${
        active
          ? "border-l-4 border-green-400 bg-green-900/30 text-green-300"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`,
      icon: active ? "text-green-300" : "text-gray-400 group-hover:text-gray-300",
      label: active ? "text-green-200" : "",
      glow: "absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent",
      dot: "absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 transform rounded-full bg-green-400",
    };
  }
  if (role === "instructor") {
    return {
      wrap: `group relative block cursor-pointer rounded-lg px-3 py-3 transition-all duration-200 ${
        active
          ? "border-l-4 border-purple-400 bg-purple-900/30 text-purple-300"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`,
      icon: active
        ? "text-purple-300"
        : "text-gray-400 group-hover:text-gray-300",
      label: active ? "text-purple-200" : "",
      glow: "absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent",
      dot: "absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 transform rounded-full bg-purple-400",
    };
  }
  return {
    wrap: "group relative block cursor-pointer rounded-lg px-3 py-3 transition-all duration-200",
    icon: "",
    label: "",
    glow: "",
    dot: "",
  };
}

function Badge({
  role,
  label,
  value,
}: {
  role: DashboardRole;
  label: string;
  value: string;
}) {
  if (role === "admin") {
    return (
      <span
        className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{
          background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
        }}
      >
        {value}
      </span>
    );
  }
  const cls =
    label === "Exams"
      ? "bg-orange-500 animate-pulse"
      : label === "Exam History"
        ? "bg-blue-500"
        : role === "instructor"
          ? "bg-purple-600"
          : "bg-green-600";
  return (
    <span
      className={`ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${cls}`}
    >
      {value}
    </span>
  );
}

function NavCategories({
  categories,
  role,
  pathname,
}: {
  categories: SidebarNavCategory[];
  role: DashboardRole;
  pathname: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-black px-0 pb-4 pt-2">
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-4 last:mb-0">
          <div className="mb-3 hidden px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 sm:block">
            {category.category}
          </div>
          <div className="space-y-1 px-2">
            {category.items.map((item, itemIndex) => {
              const active = isNavActive(pathname, item.href);
              const c = navButtonClasses(role, active);

              const inner = (
                <>
                  <div className="flex w-full items-center gap-3">
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-colors duration-200 ${c.icon}`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <span
                        className={`truncate text-sm font-medium ${c.label}`}
                      >
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge
                          role={role}
                          label={item.label}
                          value={item.badge}
                        />
                      ) : null}
                    </div>
                  </div>
                  {active ? (
                    <>
                      <div className={c.glow} />
                      <div className={c.dot} />
                    </>
                  ) : null}
                </>
              );

              if (item.href !== "#") {
                return (
                  <Link key={itemIndex} href={item.href} className={c.wrap}>
                    {inner}
                  </Link>
                );
              }

              return (
                <a
                  key={itemIndex}
                  href="#"
                  className={c.wrap}
                  onClick={(e) => e.preventDefault()}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminNavCategories({
  categories,
  pathname,
}: {
  categories: SidebarNavCategory[];
  pathname: string;
}) {
  return (
    <div
      className="flex-1 overflow-y-auto px-0 pb-4 pt-2"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {categories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-4 last:mb-0">
          <div
            className="mb-3 hidden px-4 text-xs font-semibold uppercase tracking-wider sm:block"
            style={{ color: "rgba(123, 44, 191, 0.6)" }}
          >
            {category.category}
          </div>
          <div className="space-y-1 px-2">
            {category.items.map((item, itemIndex) => {
              const active = isNavActive(pathname, item.href);
              const base = "group relative block rounded-lg px-3 py-3 transition-all duration-200";

              const content = (
                <>
                  <div className="flex w-full items-center gap-3">
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center transition-colors duration-200"
                      style={{ color: active ? "#EC4899" : "#9CA3AF" }}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between">
                      <span
                        className="truncate text-sm font-medium"
                        style={{ color: active ? "#EC4899" : "#374151" }}
                      >
                        {item.label}
                      </span>
                      {item.badge ? (
                        <Badge
                          role="admin"
                          label={item.label}
                          value={item.badge}
                        />
                      ) : null}
                    </div>
                  </div>
                  {active ? (
                    <>
                      <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%)",
                        }}
                      />
                      <div
                        className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 transform rounded-full"
                        style={{ backgroundColor: "#A855F7" }}
                      />
                    </>
                  ) : null}
                </>
              );

              if (item.href !== "#") {
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={base}
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                            borderLeft: "4px solid #A855F7",
                            color: "#EC4899",
                          }
                        : { color: "#6B7280" }
                    }
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <a
                  key={itemIndex}
                  href="#"
                  className={base}
                  style={{ color: "#6B7280" }}
                  onClick={(e) => e.preventDefault()}
                >
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSidebar() {
  const role = useAppSelector((s) => s.ui.dashboardView);
  const user = useAppSelector((s) => s.auth.user);
  const pathname = usePathname();
  const categories = useMemo(
    () => getDashboardSidebarNavForPath(role, pathname),
    [role, pathname],
  );

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : role === "student"
      ? "Student"
      : role === "instructor"
        ? "Teacher"
        : "Admin";

  const initials = getUserInitials(displayName);

  if (role === "admin") {
    return (
      <aside
        className="relative flex w-full shrink-0 flex-col border-b transition-all duration-300 ease-in-out sm:w-80 sm:border-b-0"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "rgba(123, 44, 191, 0.2)",
        }}
      >
        <header
          className="rounded-b-2xl transition-all duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(123, 44, 191, 0.2)",
          }}
        >
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                E
              </div>
              <span
                className="truncate text-base font-semibold"
                style={{ color: "#7B2CBF" }}
              >
                EduPlatform
              </span>
            </div>
          </div>
        </header>

        <AdminNavCategories categories={categories} pathname={pathname} />

        <footer
          className="rounded-t-2xl transition-all duration-300"
          style={{
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid rgba(123, 44, 191, 0.2)",
          }}
        >
          <div className="space-y-1 p-4">
            <Link
              href="/admin/settings"
              className="group relative block rounded-lg px-3 py-3 transition-all duration-200"
              style={{ color: "#6B7280" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center"
                  style={{ color: "#9CA3AF" }}
                >
                  <LuSettings className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium" style={{ color: "#374151" }}>
                  Settings
                </span>
              </div>
            </Link>
            <Link
              href="/login"
              className="group relative block rounded-lg px-3 py-3 transition-all duration-200"
              style={{ color: "#EF4444" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-red-500">
                  <LuLogOut className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Logout</span>
              </div>
            </Link>
          </div>
        </footer>
      </aside>
    );
  }

  const darkShell =
    "relative flex w-full shrink-0 flex-col border-b border-gray-800 bg-black transition-all duration-300 ease-in-out sm:w-80 sm:border-b-0";

  return (
    <aside className={darkShell}>
      {role === "student" ? (
        <header className="rounded-b-2xl border-b border-gray-700 bg-gray-900 transition-all duration-300">
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-green-700 text-sm font-bold text-white">
                E
              </div>
              <span className="truncate text-base font-semibold text-white">
                EduPlatform
              </span>
            </div>
          </div>
        </header>
      ) : (
        <header className="rounded-b-2xl border-b border-gray-700 bg-gray-900 transition-all duration-300">
          <div className="flex items-center gap-3 px-4 py-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className="size-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white">
                {user ? initials : "T"}
              </div>
            )}
            <div className="grid min-w-0 flex-1 text-left">
              <span className="truncate text-lg font-bold text-white">
                {user ? displayName : "Teacher"}
              </span>
              <span className="hidden truncate text-sm text-gray-300 sm:block">
                Teacher
              </span>
            </div>
          </div>
        </header>
      )}

      <NavCategories
        categories={categories}
        role={role}
        pathname={pathname}
      />

      <footer className="rounded-t-2xl border-t border-gray-700 bg-gray-900 transition-all duration-300">
        <div className="p-4">
          {role === "instructor" ? (
            <div className="space-y-1">
              <Link
                href="/instructor/settings"
                className="group relative flex cursor-pointer rounded-lg px-3 py-3 text-gray-300 transition-all duration-200 hover:bg-gray-800 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-400 group-hover:text-gray-300">
                    <LuSettings className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </Link>
              <Link
                href="/login"
                className="group relative flex cursor-pointer rounded-lg px-3 py-3 text-red-400 transition-all duration-200 hover:bg-red-900/20 hover:text-red-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-red-400 group-hover:text-red-300">
                    <LuLogOut className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">Logout</span>
                </div>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="group relative flex cursor-pointer rounded-lg px-3 py-3 text-red-400 transition-all duration-200 hover:bg-red-900/20 hover:text-red-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-red-400 group-hover:text-red-300">
                  <LuLogOut className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Logout</span>
              </div>
            </Link>
          )}
        </div>
      </footer>
    </aside>
  );
}
