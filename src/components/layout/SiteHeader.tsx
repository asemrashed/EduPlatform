"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "All Courses" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.quantity, 0),
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-surface/70 shadow-[var(--shadow-header)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8 lg:gap-12">
          <Link
            href="/"
            className="shrink-0 font-[family-name:var(--font-headline)] text-xl font-black tracking-tighter text-primary sm:text-2xl"
          >
            EduPlatform
          </Link>
          <nav
            className="hidden md:flex md:items-center md:gap-8"
            aria-label="Primary"
          >
            {NAV.map(({ href, label }) => (
              <NavLink key={label} href={href} label={label} pathname={pathname} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/cart"
            className="relative hidden rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary sm:inline-flex sm:items-center"
          >
            Cart
            {cartCount > 0 ? (
              <span className="ml-1.5 min-w-[1.25rem] rounded-full bg-secondary px-1.5 py-0.5 text-center text-xs font-bold text-on-secondary">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary md:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden rounded-xl bg-gradient-to-br from-primary to-primary-container px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-blue-900/20 transition-transform active:scale-95 sm:inline-block"
          >
            Join for free
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border/60 bg-surface px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {NAV.map(({ href, label }) => (
              <MobileNavLink
                key={`m-${label}`}
                href={href}
                label={label}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            ))}
            <Link
              href="/cart"
              className="rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-surface-container"
              onClick={() => setOpen(false)}
            >
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-3 py-3 text-center text-sm font-semibold text-muted-foreground hover:bg-surface-container"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-br from-primary to-primary-container px-4 py-3 text-center text-sm font-bold text-on-primary"
              onClick={() => setOpen(false)}
            >
              Join for free
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string | null;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 py-1 text-sm font-semibold tracking-tight transition-colors",
        active
          ? "border-primary font-bold text-primary"
          : "border-transparent text-muted-foreground hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  label,
  pathname,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string | null;
  onNavigate: () => void;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "rounded-lg px-3 py-3 text-sm font-semibold",
        active
          ? "bg-surface-container font-bold text-primary"
          : "text-foreground hover:bg-surface-container",
      )}
    >
      {label}
    </Link>
  );
}

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
