"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

import { LuShoppingBag } from "react-icons/lu";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All Courses" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { data: session } = useSession();

  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.quantity, 0),
  );

  const role = session?.user?.role;
  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "instructor"
      ? "/instructor/dashboard"
      : "/student/courses";

  const avatarLabel =
    session?.user?.name?.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    setOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".avatar-menu")) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto flex max-w-[96%] mt-2 md:mt-4 items-center justify-between gap-4 px-4 py-4 sm:px-8 border-b border-border/60 bg-surface rounded-md md:rounded-2xl shadow-[var(--shadow-header)] backdrop-blur-xl">

        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center gap-8 lg:gap-12">
          <Link
            href="/"
            className="shrink-0 text-xl font-black tracking-tighter text-primary sm:text-2xl"
          >
            EduPlatform
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-8">
            {NAV.map(({ href, label }) => (
              <NavLink key={label} href={href} label={label} pathname={pathname} />
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-full px-3 text-sm font-semibold text-muted-foreground hover:text-primary inline-flex"
          >
            <LuShoppingBag className="text-lg md:text-2xl" />
            {cartCount > 0 && (
              <span className="ml-1.5 min-w-[1.25rem] rounded-full bg-secondary px-1.5 py-0.5 text-xs font-bold text-on-secondary">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {session?.user ? (
            <div className="relative inline-block avatar-menu">
              <button
                onClick={() => setAvatarOpen((v) => !v)}
                className="h-7 md:h-9 w-7 md:w-9 rounded-full bg-primary text-sm font-bold text-on-primary flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                {avatarLabel}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md bg-white shadow-lg border border-border z-50 overflow-hidden">
                  <Link
                    href={dashboardHref}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setAvatarOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-primary hover:bg-primary transition-all duration-300 hover:text-primary-container px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="hidden rounded-xl bg-gradient-to-br from-primary to-primary/50 hover:bg-primary transition-all duration-300 px-6 py-3 text-sm font-bold text-on-primary shadow-lg sm:inline-block"
              >
                Join for free
              </Link>
            </>
          )}

          {/* Mobile button */}
          <button
            className="inline-flex rounded-lg p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="border-t border-border/60 w-full bg-surface px-4 py-4 md:hidden">
          <nav className="flex max-w-[96%] mx-auto flex-col gap-1">
            {NAV.map(({ href, label }) => (
              <MobileNavLink
                key={label}
                href={href}
                label={label}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, pathname }: any) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 py-1 text-sm font-semibold",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, pathname, onNavigate }: any) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "rounded-lg px-3 py-3 text-sm",
        active
          ? "bg-surface-container text-primary"
          : "hover:bg-surface-container",
      )}
    >
      {label}
    </Link>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}