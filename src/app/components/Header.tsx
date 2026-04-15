"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logoutUser, checkAuthStatus } from "@/lib/slices/authSlice";
import Image from "next/image";
import type { WebsiteContent as WebsiteContentType } from "@/lib/website-content";
import {
  LuBookOpen as BookOpen,
  LuHouse as Home,
  LuLayoutDashboard as LayoutDashboard,
} from "react-icons/lu";

interface WebsiteContent {
  metaTitle?: string;
  marquee: {
    enabled: boolean;
    messages: string[];
    gradientFrom: string;
    gradientTo: string;
  };
  contact: {
    registrationNumber: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram?: string;
    youtube?: string;
  };
  branding: {
    logoText: string;
    logoTextColor1: string;
    logoTextColor2: string;
    logoIconColor1: string;
    logoIconColor2: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  navigation: {
    home: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    category: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    pages: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    courses: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    account: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    contact: {
      label: string;
      href: string;
    };
  };
  buttons: {
    liveCourse: {
      enabled: boolean;
      text: string;
      href?: string;
    };
    login: {
      text: string;
      href: string;
    };
  };
  mobileMenu: {
    items: Array<{ label: string; href: string }>;
  };
}

const defaultContent: WebsiteContent = {
  metaTitle: "CodeZyne - Online Learning Platform",
  marquee: {
    enabled: true,
    messages: [
      "🎉 নতুন কোর্সে ৫০% ছাড়! এখনই নিবন্ধন করুন",
      "✨ ১০০+ কোর্স উপলব্ধ - আপনার পছন্দের কোর্স খুঁজে নিন",
      "🚀 বিশেষ অফার: প্রথম ১০০ জন শিক্ষার্থী পাবে বিনামূল্যে সার্টিফিকেট",
      "📚 মাসিক নতুন কোর্স যোগ করা হচ্ছে - সর্বশেষ আপডেটের জন্য সাবস্ক্রাইব করুন",
    ],
    gradientFrom: "#EC4899",
    gradientTo: "#A855F7",
  },
  contact: {
    registrationNumber: "বাংলাদেশ সরকার অনুমোদিত রেজিঃ নং- ৩১১০৫",
  },
  socialMedia: {
    facebook: "#",
    twitter: "#",
    linkedin: "#",
  },
  branding: {
    logoText: "à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦",
    logoTextColor1: "#7B2CBF",
    logoTextColor2: "#FF6B35",
    logoIconColor1: "#FF6B35",
    logoIconColor2: "#7B2CBF",
    logoUrl: "",
    faviconUrl: "",
  },
  navigation: {
    home: {
      label: "হোম",
      items: [
        { label: "হোমপেজ", href: "/" },
        { label: "আমাদের সম্পর্কে", href: "/#about" },
        { label: "কোর্সসমূহ", href: "/#courses" },
      ],
    },
    category: {
      label: "বিভাগ",
      items: [
        { label: "ডেভেলপমেন্ট", href: "/#courses" },
        { label: "ডিজাইন", href: "/#courses" },
        { label: "মার্কেটিং", href: "/#courses" },
        { label: "ব্যবসা", href: "/#courses" },
      ],
    },
    pages: {
      label: "পাতা",
      items: [
        { label: "আমাদের সম্পর্কে", href: "/about" },
        { label: "ব্লগ", href: "/blog" },
        { label: "যোগাযোগ", href: "/contact" },
        { label: "প্রশ্নোত্তর", href: "/faq" },
      ],
    },
    courses: {
      label: "কোর্স",
      items: [
        { label: "সব কোর্স", href: "/#courses" },
        { label: "কোর্স বিস্তারিত", href: "/course-details" },
        { label: "জনপ্রিয় কোর্স", href: "/#courses" },
        { label: "নতুন কোর্স", href: "/#courses" },
      ],
    },
    account: {
      label: "হিসাব",
      items: [
        { label: "লগ ইন", href: "/login" },
        { label: "নিবন্ধন", href: "/register" },
        { label: "প্রোফাইল", href: "/profile" },
        { label: "ড্যাশবোর্ড", href: "/dashboard" },
      ],
    },
    contact: {
      label: "যোগাযোগ",
      href: "/contact",
    },
  },
  buttons: {
    liveCourse: {
      enabled: true,
      text: "লাইভ কোর্স",
    },
    login: {
      text: "লগ ইন",
      href: "/login",
    },
  },
  mobileMenu: {
    items: [
      { label: "হোম", href: "#" },
      { label: "বিভাগ", href: "#" },
      { label: "পাতা", href: "#" },
      { label: "কোর্স", href: "#" },
      { label: "হিসাব", href: "#" },
      { label: "যোগাযোগ", href: "#" },
    ],
  },
};

interface HeaderProps {
  initialContent?: WebsiteContentType;
}

export default function Header({ initialContent }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartItemCount, isLoaded: cartLoaded } = useCart();
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [content, setContent] = useState<WebsiteContent>(initialContent || defaultContent);
  const [cachedAuthStatus, setCachedAuthStatus] = useState<{ isAuthenticated: boolean; userId?: string } | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const dropdownCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";
  const isCourseDetailsPage = pathname?.startsWith("/course/") || pathname?.startsWith("/course-details");
  const { data: session, status: sessionStatus } = useSession();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);
  
  // Load cached auth status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('auth_status');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setCachedAuthStatus(parsed);
        } catch (e) {
          // Invalid cache, ignore
        }
      }
    }
  }, []);

  // Cache auth status when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && sessionStatus !== "loading") {
      const authData = {
        isAuthenticated: isAuthenticated && !!user,
        userId: user?.id || session?.user?.id
      };
      localStorage.setItem('auth_status', JSON.stringify(authData));
      setCachedAuthStatus(authData);
    }
  }, [isAuthenticated, user, session, authLoading, sessionStatus]);

  // Determine if we're still loading auth state
  // Use cached status if available to prevent flash
  const isAuthLoading = sessionStatus === "loading" || (authLoading && !cachedAuthStatus);
  const shouldShowProfile = cachedAuthStatus?.isAuthenticated || (isAuthenticated && user);
  const currentRole = user?.role || session?.user?.role;
  const dashboardHref =
    currentRole === "admin"
      ? "/admin/dashboard"
      : currentRole === "instructor"
        ? "/instructor/dashboard"
        : currentRole === "student"
          ? "/student/dashboard"
          : "/login";
  const courseHeaderBackgroundStyle =
    isCourseDetailsPage && !isSticky
      ? {
          backgroundImage: "url(https://live.themewild.com/edubo/assets/img/breadcrumb/01.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }
      : undefined;

  const handleDropdownEnter = (dropdownName: string) => {
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current);
      dropdownCloseTimeoutRef.current = null;
    }
    setOpenDropdown(dropdownName);
  };

  const handleDropdownLeave = () => {
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current);
    }
    dropdownCloseTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 220);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (profileDropdownOpen && !target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Handle logout
  const handleLogout = async () => {
    await dispatch(logoutUser());
    // Clear cached auth status
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_status');
    }
    setCachedAuthStatus(null);
    router.push('/');
    setProfileDropdownOpen(false);
  };

  // Always reset desktop dropdowns when route changes
  useEffect(() => {
    if (dropdownCloseTimeoutRef.current) {
      clearTimeout(dropdownCloseTimeoutRef.current);
      dropdownCloseTimeoutRef.current = null;
    }
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (dropdownCloseTimeoutRef.current) {
        clearTimeout(dropdownCloseTimeoutRef.current);
      }
    };
  }, []);

  // Close desktop navbar dropdown when clicking outside header
  useEffect(() => {
    if (!openDropdown) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openDropdown]);

  useEffect(() => {
    // Always fetch fresh content to ensure dynamic updates
      const fetchContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
          cache: 'no-store', // Always fetch fresh content
          });
          const data = await response.json();
          if (data.success && data.data) {
          // Merge fetched content with defaults to ensure all fields are present
          const mergedContent: WebsiteContent = {
            ...defaultContent,
            ...data.data,
            // Deep merge nested objects
            marquee: { ...defaultContent.marquee, ...(data.data.marquee || {}) },
            contact: { ...defaultContent.contact, ...(data.data.contact || {}) },
            socialMedia: { ...defaultContent.socialMedia, ...(data.data.socialMedia || {}) },
            branding: { ...defaultContent.branding, ...(data.data.branding || {}) },
            navigation: { ...defaultContent.navigation, ...(data.data.navigation || {}) },
            buttons: { ...defaultContent.buttons, ...(data.data.buttons || {}) },
            mobileMenu: { ...defaultContent.mobileMenu, ...(data.data.mobileMenu || {}) },
          };
          setContent(mergedContent);
          }
        } catch (error) {
          console.error('Error fetching website content:', error);
          // Use default content on error
        }
      };
    
    // If initialContent is provided, merge it with defaults and use it immediately
    if (initialContent) {
      const mergedInitialContent: WebsiteContent = {
        ...defaultContent,
        ...initialContent,
        // Deep merge nested objects
        marquee: { ...defaultContent.marquee, ...(initialContent.marquee || {}) },
        contact: { ...defaultContent.contact, ...(initialContent.contact || {}) },
        socialMedia: { ...defaultContent.socialMedia, ...(initialContent.socialMedia || {}) },
        branding: { ...defaultContent.branding, ...(initialContent.branding || {}) },
        navigation: { ...defaultContent.navigation, ...(initialContent.navigation || {}) },
        buttons: { ...defaultContent.buttons, ...(initialContent.buttons || {}) },
        mobileMenu: { ...defaultContent.mobileMenu, ...(initialContent.mobileMenu || {}) },
      };
      setContent(mergedInitialContent);
    }
    
    // Always fetch fresh content in the background for dynamic updates
    fetchContent();
  }, [initialContent]);

  return (
    <>
      {/* Marquee Banner */}
      {content.marquee.enabled && (
        <div 
          className="hidden overflow-hidden border-b border-gray-200 py-2 md:block"
          style={{
            background: `linear-gradient(to right, ${content.marquee.gradientFrom}, ${content.marquee.gradientTo})`
          }}
        >
          <div className="marquee-container flex">
            <div className="marquee-content flex min-w-full items-center gap-8 whitespace-nowrap text-xs font-medium text-white">
              {content.marquee.messages.map((text, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {text}
                  <span className="h-1 w-1 rounded-full bg-white"></span>
                </span>
              ))}
            </div>
            <div className="marquee-content flex min-w-full items-center gap-8 whitespace-nowrap text-xs font-medium text-white" aria-hidden="true">
              {content.marquee.messages.map((text, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {text}
                  <span className="h-1 w-1 rounded-full bg-white"></span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Header - Registration Info */}
      <div className="border-b border-gray-200 bg-gray-50 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 md:px-6 lg:px-8 sm:justify-between">
          <div className="flex items-center gap-2">
            {/* Registration Number */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF]">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                {content.contact?.registrationNumber || 'বাংলাদেশ সরকার অনুমোদিত রেজিঃ নং- ৩১১০৫'}
              </span>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="hidden items-center gap-3 sm:flex">
            {content.socialMedia.facebook && (
              <a
                href={content.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-[#7B2CBF]"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {content.socialMedia.twitter && (
              <a
                href={content.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-[#7B2CBF]"
                aria-label="Twitter"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {content.socialMedia.linkedin && (
              <a
                href={content.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-[#7B2CBF]"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        ref={headerRef}
        className={`w-full px-4 py-4 md:px-6 lg:px-8 ${
          isSticky
            ? "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg animate-slide-down"
            : isHomePage
              ? "relative"
              : "relative bg-white"
        }`}
        style={courseHeaderBackgroundStyle}
      >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          {content.branding.logoUrl?.trim() && (
            <img
              src={content.branding.logoUrl}
              alt={content.branding.logoText || 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦ logo'}
              className="h-14 w-14 rounded object-contain"
            />
          )}
          <span
            className="text-lg font-bold tracking-tight md:text-xl"
            style={{ color: content.branding.logoTextColor1 }}
          >
            {content.branding.logoText || 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦'}
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden items-center gap-5 lg:gap-6 xl:gap-8 md:flex">
          {/* Home Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("home")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="group flex items-center gap-1.5 text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              <span>{content.navigation.home.label}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`mt-0.5 transition-transform ${openDropdown === "home" ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openDropdown === "home" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 pointer-events-none"></div>
                <div className="relative">
                  {content.navigation.home.items.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setOpenDropdown(null)} className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#7B2CBF]/10 hover:to-[#A855F7]/10 hover:text-[#7B2CBF] transition-all" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                      {item.icon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF] opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("category")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="group flex items-center gap-1.5 text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              <span>{content.navigation.category.label}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`mt-0.5 transition-transform ${openDropdown === "category" ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openDropdown === "category" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 pointer-events-none"></div>
                <div className="relative">
                  {content.navigation.category.items.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setOpenDropdown(null)} className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 hover:text-blue-600 transition-all" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                      {item.icon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pages Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("pages")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="group flex items-center gap-1.5 text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              <span>{content.navigation.pages.label}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`mt-0.5 transition-transform ${openDropdown === "pages" ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openDropdown === "pages" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 pointer-events-none"></div>
                <div className="relative">
                  {content.navigation.pages.items.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setOpenDropdown(null)} className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#7B2CBF]/10 hover:to-[#A855F7]/10 hover:text-[#7B2CBF] transition-all" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                      {item.icon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF] opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Courses Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("courses")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="group flex items-center gap-1.5 text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              <span>{content.navigation.courses.label}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`mt-0.5 transition-transform ${openDropdown === "courses" ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openDropdown === "courses" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 pointer-events-none"></div>
                <div className="relative">
                  {content.navigation.courses.items.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setOpenDropdown(null)} className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-amber-500/10 hover:text-orange-600 transition-all" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                      {item.icon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Account Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleDropdownEnter("account")}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="group flex items-center gap-1.5 text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              <span>{content.navigation.account.label}</span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`mt-0.5 transition-transform ${openDropdown === "account" ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              >
                <path
                  d="M2 3.5L5 6.5L8 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {openDropdown === "account" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 pointer-events-none"></div>
                <div className="relative">
                  {content.navigation.account.items.map((item, index) => (
                    <Link key={index} href={item.href} onClick={() => setOpenDropdown(null)} className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 hover:text-indigo-600 transition-all" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                      {item.icon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d={item.icon} />
                        </svg>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href={content.navigation.contact.href}
            onClick={() => setOpenDropdown(null)}
            className="text-[15px] font-medium text-gray-800 transition-colors hover:text-[#7B2CBF]"
            style={{ fontFamily: "var(--font-bengali), sans-serif" }}
          >
            {content.navigation.contact.label}
          </Link>
        </nav>

        {/* Right Side Icons and Button */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Search Icon */}
          {/* <button className="hidden text-gray-700 transition-colors hover:text-[#7B2CBF] md:block">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 16.5L20 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button> */}

          {/* Shopping Cart Icon */}
          <Link href="/cart" className="relative hidden text-gray-700 transition-colors hover:text-[#7B2CBF] md:block">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H4.5L5.5 5M7.5 15.5H17.5L21 7H5.5M7.5 15.5L5.5 5M7.5 15.5C6.94772 15.5 6.5 15.9477 6.5 16.5C6.5 17.0523 6.94772 17.5 7.5 17.5C8.05228 17.5 8.5 17.0523 8.5 16.5M7.5 15.5H17.5M17.5 15.5C16.9477 15.5 16.5 15.9477 16.5 16.5C16.5 17.0523 16.9477 17.5 17.5 17.5C18.0523 17.5 18.5 17.0523 18.5 16.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {cartLoaded && getCartItemCount() > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#7B2CBF] text-[10px] font-semibold text-white">
                {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
              </span>
            )}
          </Link>

          {/* Live Course Button */}
          {content.buttons.liveCourse.enabled && (
            <Link
              href={content.buttons.liveCourse.href || "#"}
              className="group hidden items-center gap-2 rounded-lg border-2 border-[#FF6B35] bg-white px-4 py-2.5 text-sm font-semibold text-[#FF6B35] transition-all hover:bg-[#FF6B35] hover:text-white hover:shadow-lg md:flex"
              style={{
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <div className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-[#FF6B35] opacity-75"></span>
                <span className="relative h-2 w-2 rounded-full bg-[#FF6B35]"></span>
              </div>
              <span>{content.buttons.liveCourse.text}</span>
            </Link>
          )}

          {/* User Profile or Login Button */}
          {!isAuthLoading && shouldShowProfile ? (
            <div className="relative hidden md:block profile-dropdown-container">
              <button
                className="cursor-pointer flex items-center gap-2 rounded-full transition-all hover:opacity-80"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#A855F7]">
                  {user?.image || session?.user?.image ? (
                    <Image
                      src={user?.image || session?.user?.image || "/default-avatar.png"}
                      alt={user?.name || "User"}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {(user?.name || session?.user?.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl bg-white shadow-2xl border border-gray-100 py-2 animate-fade-in-up overflow-hidden profile-dropdown-container">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 pointer-events-none"></div>
                  <div className="relative">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                        {user?.name || session?.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{user?.email || session?.user?.email}</p>
                    </div>
                    {/* Dashboard Link */}
                    {user?.role === 'student' && (
                      <Link
                        href="/student/courses"
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#7B2CBF]/10 hover:to-[#A855F7]/10 hover:text-[#7B2CBF] transition-all"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF] opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium">ড্যাশবোর্ড</span>
                      </Link>
                    )}
                    {user?.role === 'instructor' && (
                      <Link
                        href="/instructor/dashboard"
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#7B2CBF]/10 hover:to-[#A855F7]/10 hover:text-[#7B2CBF] transition-all"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF] opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium">ড্যাশবোর্ড</span>
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#7B2CBF]/10 hover:to-[#A855F7]/10 hover:text-[#7B2CBF] transition-all"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF] opacity-60 group-hover:opacity-100 transition-opacity">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-medium">ড্যাশবোর্ড</span>
                      </Link>
                    )}
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600 opacity-60 group-hover:opacity-100 transition-opacity">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium">লগআউট</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isAuthLoading ? (
            <Link
              href={content.buttons.login.href}
              className="group/btn relative hidden items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 overflow-hidden md:flex"
              style={{
                fontFamily: "var(--font-bengali), sans-serif",
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
              }}
            >
              {/* Shine effect */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"></span>
              
              {/* Button content */}
              <span className="relative z-10 flex items-center gap-2">
                <span>{content.buttons.login.text}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
                >
                  <path
                    d="M5 13L13 5M13 5H7M13 5V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ) : null}

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 transition-colors hover:text-[#7B2CBF] md:hidden"
            aria-label={isMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {isMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12H21M3 6H21M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 top-full z-50 w-full bg-white shadow-lg md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            {content.mobileMenu.items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="font-medium text-gray-800"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Login/Logout Section */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              {!isAuthLoading && shouldShowProfile ? (
                <>
                  {/* User Info */}
                  <div className="px-2 py-3 mb-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-[#A855F7] flex-shrink-0">
                        {user?.image || session?.user?.image ? (
                          <Image
                            src={user?.image || session?.user?.image || "/default-avatar.png"}
                            alt={user?.name || "User"}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {(user?.name || session?.user?.name || "U")[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                          {user?.name || session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || session?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Link */}
                  {user?.role === 'student' && (
                    <Link
                      href="/student/courses"
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all mb-2"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF]">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium">ড্যাশবোর্ড</span>
                    </Link>
                  )}
                  {user?.role === 'instructor' && (
                    <Link
                      href="/instructor/dashboard"
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all mb-2"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF]">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium">ড্যাশবোর্ড</span>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all mb-2"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#7B2CBF]">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-medium">ড্যাশবোর্ড</span>
                    </Link>
                  )}
                  
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-2 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-600">
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-medium">লগআউট</span>
                  </button>
                </>
              ) : !isAuthLoading ? (
                <Link
                  href={content.buttons.login.href}
                  className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all"
                  style={{
                    fontFamily: "var(--font-bengali), sans-serif",
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                    boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                  }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{content.buttons.login.text}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    fill="none"
                  >
                    <path
                      d="M5 13L13 5M13 5H7M13 5V11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      )}
      </header>

      {/* Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
          <Link
            href="/"
            className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
              pathname === "/" ? "text-[#7B2CBF]" : "text-gray-500"
            }`}
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
            <span className="truncate text-xs font-medium">Home</span>
          </Link>

          <Link
            href="/all-courses"
            className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
              pathname === "/all-courses" || pathname.startsWith("/course/")
                ? "text-[#7B2CBF]"
                : "text-gray-500"
            }`}
            aria-label="Courses"
          >
            <BookOpen className="h-5 w-5" />
            <span className="truncate text-xs font-medium">Courses</span>
          </Link>

          <Link
            href={dashboardHref}
            className={`flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
              pathname.includes("/dashboard") ? "text-[#7B2CBF]" : "text-gray-500"
            }`}
            aria-label="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="truncate text-xs font-medium">Dashboard</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
