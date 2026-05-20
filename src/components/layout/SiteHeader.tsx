"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { useAppSelector } from "@/store/hooks";
import {
  defaultWebsiteContent,
  type WebsiteContent,
} from "@/lib/websiteContentDefaults";

import { LuShoppingBag } from "react-icons/lu";
import { BrandLogo } from "@/components/layout/BrandLogo";

const FALLBACK_NAV = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All Courses" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
] as const;

type NavItem = { href: string; label: string };

function resolveHeaderNav(cmsData?: WebsiteContent | null): NavItem[] {
  const items = cmsData?.mobileMenu?.items?.filter(
    (item) => item.label?.trim() && item.href?.trim(),
  );
  if (items && items.length > 0) {
    return items.map((item) => ({
      href: item.href.trim(),
      label: item.label.trim(),
    }));
  }
  return [...FALLBACK_NAV];
}

function resolveHeaderBranding(cmsData?: WebsiteContent | null) {
  const branding = cmsData?.branding;
  const defaults = defaultWebsiteContent.branding;
  return {
    logoText: branding?.logoText?.trim() || defaults.logoText,
    logoUrl: branding?.logoUrl?.trim() || "",
  };
}

function resolveHeaderCtas(cmsData?: WebsiteContent | null) {
  const defaults = defaultWebsiteContent;
  const login = cmsData?.buttons?.login;
  const accountItems = cmsData?.navigation?.account?.items;
  const registerItem = accountItems?.find(
    (item) => item.href?.trim() === "/register",
  );
  const fallbackRegister = defaults.navigation.account.items.find(
    (item) => item.href === "/register",
  );

  return {
    signIn: {
      text: login?.text?.trim() || defaults.buttons.login.text,
      href: login?.href?.trim() || defaults.buttons.login.href,
    },
    register: {
      text:
        registerItem?.label?.trim() ||
        fallbackRegister?.label ||
        "Join for free",
      href: registerItem?.href?.trim() || fallbackRegister?.href || "/register",
    },
  };
}

type SiteHeaderProps = {
  cmsData?: WebsiteContent | null;
};

export function SiteHeader({ cmsData }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const { data: session } = useSession();

  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((n, i) => n + i.quantity, 0),
  );
  const coursesStatus = useAppSelector((s) => s.courses.status);
  const publicCoursesCount = useAppSelector((s) => s.courses.publicList.length);
  const isHomeCatalogLoading =
    pathname === "/" &&
    (coursesStatus === "idle" || coursesStatus === "loading") &&
    publicCoursesCount === 0;

  const role = session?.user?.role;
  const dashboardHref =
    role === "admin"
      ? "/admin/dashboard"
      : role === "instructor"
      ? "/instructor/dashboard"
      : "/student/dashboard";

  const avatarLabel =
    session?.user?.name?.trim().charAt(0).toUpperCase() || "U";

  const nav = useMemo(() => resolveHeaderNav(cmsData), [cmsData]);
  const branding = useMemo(() => resolveHeaderBranding(cmsData), [cmsData]);
  const ctas = useMemo(() => resolveHeaderCtas(cmsData), [cmsData]);

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
      <div
        className={cn(
          "mx-auto flex max-w-[96%] mt-2 md:mt-4 items-center justify-between gap-4 px-4 py-4 sm:px-8 border-b border-border/60 bg-surface rounded-md md:rounded-2xl shadow-[var(--shadow-header)] backdrop-blur-xl",
          isHomeCatalogLoading && "animate-pulse",
        )}
      >

        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center gap-8 lg:gap-12">
          <Link href="/" className="shrink-0">
            <BrandLogo
              logoUrl={branding.logoUrl}
              logoText={branding.logoText}
              textClassName="text-xl sm:text-2xl"
            />
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-8">
            {nav.map(({ href, label }) => (
              <NavLink
                key={`${href}-${label}`}
                href={href}
                label={label}
                pathname={pathname}
              />
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
                href={ctas.signIn.href}
                className="rounded-full border border-primary hover:bg-primary transition-all duration-300 hover:text-primary-container px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-primary inline-block"
              >
                {ctas.signIn.text}
              </Link>
              <Link
                href={ctas.register.href}
                className="hidden rounded-xl bg-gradient-to-br from-primary to-primary/50 hover:bg-primary transition-all duration-300 px-6 py-3 text-sm font-bold text-on-primary shadow-lg sm:inline-block"
              >
                {ctas.register.text}
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
            {nav.map(({ href, label }) => (
              <MobileNavLink
                key={`${href}-${label}`}
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