"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      router.push("/otp-verification");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Wavy Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4 md:px-6 lg:px-8">
        {/* Wavy Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="url(#wave-gradient-forgot)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-forgot" x1="0%" y1="0%" x2="100%" y2="0%">
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
            পাসওয়ার্ড পুনরুদ্ধার
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
              পাসওয়ার্ড পুনরুদ্ধার
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Form Section */}
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Forgot Password Card */}
          <div className="rounded-2xl bg-white p-8 shadow-2xl md:p-10">
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

            {/* Subtitle */}
            <p
              className="mb-8 text-center text-sm text-gray-600"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              আপনার মোবাইল নম্বর দিয়ে পাসওয়ার্ড পুনরুদ্ধার করুন
            </p>

            {/* Info Box */}
            <div className="mb-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 text-blue-600 shrink-0"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 16V12M12 8H12.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p
                  className="text-sm text-blue-800"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  আপনার নিবন্ধিত মোবাইল নম্বর লিখুন। আমরা আপনার মোবাইলে একটি OTP কোড পাঠাবো যা দিয়ে আপনি আপনার পাসওয়ার্ড পুনরুদ্ধার করতে পারবেন।
                </p>
              </div>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="আপনার মোবাইল নম্বর লিখুন (০১XXXXXXXXX)"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                }}
              >
                <span>OTP পাঠান</span>
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

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                মনে পড়ে গেছে?{" "}
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

