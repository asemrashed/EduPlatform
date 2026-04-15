"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Register() {
  const [branding, setBranding] = useState({
    logoText: "ময়নামতি সার্ভে টেকনিক্যাল ট্রেনিং ইনস্টিটিউট",
    logoTextColor1: "#7B2CBF",
    logoUrl: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch("/api/website-content", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        const apiBranding = data?.data?.branding;
        if (!apiBranding) return;

        setBranding((prev) => ({
          ...prev,
          logoText: apiBranding.logoText || prev.logoText,
          logoTextColor1: apiBranding.logoTextColor1 || prev.logoTextColor1,
          logoUrl: apiBranding.logoUrl || "",
        }));
      } catch (err) {
        console.error("Failed to fetch branding:", err);
      }
    };

    fetchBranding();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Wavy Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4 md:px-6 lg:px-8">
        {/* Wavy Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="url(#wave-gradient-register)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-register" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Title */}
          <h1
            className="mb-4 text-center text-4xl font-bold text-[#7B2CBF] md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-bengali), sans-serif" }}
          >
            নিবন্ধন করুন
          </h1>

          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-[#7B2CBF] transition-colors"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              হোম
            </Link>
            <span className="text-gray-400">{" >> "}</span>
            <span className="text-[#7B2CBF] font-semibold" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
              নিবন্ধন
            </span>
          </div>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-10">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.logoText || "à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦ logo"}
                  className="h-10 w-10 rounded object-contain"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center">
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="18" cy="11" r="7" fill="#FF6B35" />
                    <path
                      d="M11 25C11 21.5 13.5 18.5 18 18.5C22.5 18.5 25 21.5 25 25V29H11V25Z"
                      fill="#7B2CBF"
                    />
                  </svg>
                </div>
              )}
              <span className="text-xl font-bold tracking-tight" style={{ color: branding.logoTextColor1 }}>
                {branding.logoText}
              </span>
            </div>

            {/* Subtitle */}
            <p
              className="mb-8 text-center text-sm text-gray-600"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              একটি নতুন অ্যাকাউন্ট তৈরি করুন
            </p>

            {/* Register Form */}
            <form className="space-y-5">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  আপনার নাম
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path
                        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  আপনার মোবাইল নম্বর
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path
                        d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C9.4 21 0 11.6 0 0.08C0 -0.52 0.48 -1 1.08 -1H4.08C4.68 -1 5.16 -0.52 5.16 0.08C5.16 1.08 5.28 2.04 5.52 2.96C5.64 3.4 5.56 3.88 5.24 4.2L3.68 5.76C4.84 8.4 6.6 10.16 9.24 11.32L10.8 9.76C11.12 9.44 11.6 9.36 12.04 9.48C12.96 9.72 13.92 9.84 14.92 9.84C15.52 9.84 16 10.32 16 10.92V13.92"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="আপনার মোবাইল নম্বর লিখুন (০১XXXXXXXXX)"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  আপনার পাসওয়ার্ড
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path
                        d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C3.44772 10 3 10.4477 3 11V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V11C21 10.4477 20.5523 10 20 10H18M6 10H18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="আপনার পাসওয়ার্ড লিখুন"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M18 6L6 18M18 18L6 6" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  পাসওয়ার্ড নিশ্চিত করুন
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                      <path
                        d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C3.44772 10 3 10.4477 3 11V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V11C21 10.4477 20.5523 10 20 10H18M6 10H18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="পাসওয়ার্ড আবার লিখুন"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                        <path d="M18 6L6 18M18 18L6 6" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#7B2CBF] focus:ring-[#7B2CBF]"
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-sm text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  আমি{" "}
                  <Link href="/terms" className="font-medium text-[#7B2CBF] hover:text-[#A855F7] transition-colors">
                    শর্তাবলী
                  </Link>{" "}
                  এবং{" "}
                  <Link href="/privacy" className="font-medium text-[#7B2CBF] hover:text-[#A855F7] transition-colors">
                    গোপনীয়তা নীতি
                  </Link>{" "}
                  পড়েছি এবং সম্মত
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                }}
              >
                <span>নিবন্ধন করুন</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M5 13L13 5M13 5H7M13 5V11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            {/* Social Media Registration */}
            <div className="mt-8">
              <p
                className="mb-4 text-center text-sm text-gray-600"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                সোশ্যাল মিডিয়া দিয়ে নিবন্ধন করুন
              </p>
              <div className="flex items-center justify-center gap-4">
                {/* Facebook */}
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white transition-all hover:scale-110 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                {/* Google */}
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gray-300 text-gray-700 transition-all hover:scale-110 hover:shadow-lg"
                  aria-label="Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                </button>
                {/* Twitter/X */}
                <button
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-all hover:scale-110 hover:shadow-lg"
                  aria-label="Twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#7B2CBF] hover:text-[#A855F7] transition-colors"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  লগ ইন করুন
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
