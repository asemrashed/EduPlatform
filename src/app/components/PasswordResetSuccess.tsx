"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PasswordResetSuccess() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      // Auto-redirect to login page after countdown
      window.location.href = "/login";
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Wavy Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4 md:px-6 lg:px-8">
        {/* Wavy Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="url(#wave-gradient-success)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
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
            সফল!
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
            <Link
              href="/login"
              className="hover:text-[#7B2CBF] transition-colors"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              লগ ইন
            </Link>
            <span className="text-gray-400">{" >> "}</span>
            <span className="text-[#7B2CBF] font-semibold" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
              পাসওয়ার্ড পরিবর্তন সফল
            </span>
          </div>
        </div>
      </div>

      {/* Success Section */}
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Success Card */}
          <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-10">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                {/* Animated Circle */}
                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Orange head */}
                  <circle cx="18" cy="11" r="7" fill="#FF6B35" />
                  {/* Purple body */}
                  <path
                    d="M11 25C11 21.5 13.5 18.5 18 18.5C22.5 18.5 25 21.5 25 25V29H11V25Z"
                    fill="#7B2CBF"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-[#7B2CBF]">Code</span>
                <span className="text-[#FF6B35]">Zyne</span>
              </span>
            </div>

            {/* Success Message */}
            <div className="mb-8 text-center">
              <h2
                className="mb-3 text-2xl font-bold text-gray-800"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!
              </h2>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন আপনি নতুন পাসওয়ার্ড দিয়ে লগ ইন করতে পারবেন।
              </p>
            </div>

        

            {/* Countdown Timer */}
            <div className="mb-6 text-center">
              <p
                className="text-sm text-gray-600 mb-2"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                স্বয়ংক্রিয়ভাবে লগ ইন পেজে যাচ্ছে...
              </p>
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-50 px-4 py-2">
                <div className="relative h-8 w-8">
                  <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#7B2CBF"
                      strokeWidth="2"
                      strokeDasharray={`${(countdown / 5) * 100.53} 100.53`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#7B2CBF]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {countdown}
                  </span>
                </div>
                <span
                  className="text-sm font-medium text-[#7B2CBF]"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  সেকেন্ড
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-white transition-all hover:shadow-lg"
              style={{
                fontFamily: "var(--font-bengali), sans-serif",
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              }}
            >
              <span>এখনই লগ ইন করুন</span>
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
            </Link>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-[#7B2CBF] transition-colors"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                ← হোমপেজে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

