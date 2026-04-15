"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: "", color: "" };
    if (pwd.length < 6) return { strength: 1, label: "দুর্বল", color: "bg-red-500" };
    if (pwd.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
      return { strength: 2, label: "মাঝারি", color: "bg-yellow-500" };
    }
    return { strength: 3, label: "শক্তিশালী", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Section with Wavy Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12 px-4 md:px-6 lg:px-8">
        {/* Wavy Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,200 L0,200 Z"
              fill="url(#wave-gradient-reset)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-reset" x1="0%" y1="0%" x2="100%" y2="0%">
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
            নতুন পাসওয়ার্ড সেট করুন
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
            <Link
              href="/forgot-password"
              className="hover:text-[#7B2CBF] transition-colors"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              পাসওয়ার্ড পুনরুদ্ধার
            </Link>
            <span className="text-gray-400">{" >> "}</span>
            <span className="text-[#7B2CBF] font-semibold" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
              নতুন পাসওয়ার্ড
            </span>
          </div>
        </div>
      </div>

      {/* Reset Password Form Section */}
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Reset Password Card */}
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
              আপনার নতুন পাসওয়ার্ড সেট করুন
            </p>

            {/* Success Info Box */}
            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 text-green-600 shrink-0"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p
                  className="text-sm text-green-800"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  OTP সফলভাবে যাচাই করা হয়েছে। এখন আপনার নতুন পাসওয়ার্ড সেট করুন।
                </p>
              </div>
            </div>

            {/* Reset Password Form */}
            <form className="space-y-5">
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  নতুন পাসওয়ার্ড
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড লিখুন"
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
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="mb-1 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                      />
                    </div>
                    <p
                      className="text-xs text-gray-600"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      পাসওয়ার্ড শক্তি: <span className="font-semibold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    পাসওয়ার্ডের প্রয়োজনীয়তা:
                  </p>
                  <ul className="ml-4 space-y-0.5 text-xs text-gray-500">
                    <li
                      className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-green-600" : ""}`}
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      <span>{password.length >= 8 ? "✓" : "•"}</span>
                      <span>অন্তত ৮ অক্ষর</span>
                    </li>
                    <li
                      className={`flex items-center gap-1.5 ${/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "text-green-600" : ""}`}
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      <span>{/(?=.*[a-z])(?=.*[A-Z])/.test(password) ? "✓" : "•"}</span>
                      <span>বড় এবং ছোট হাতের অক্ষর</span>
                    </li>
                    <li
                      className={`flex items-center gap-1.5 ${/(?=.*\d)/.test(password) ? "text-green-600" : ""}`}
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      <span>{/(?=.*\d)/.test(password) ? "✓" : "•"}</span>
                      <span>অন্তত একটি সংখ্যা</span>
                    </li>
                  </ul>
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    {password === confirmPassword ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-bengali), sans-serif" }}>পাসওয়ার্ড মিলেছে</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-red-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8V12M12 16H12.01" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-bengali), sans-serif" }}>পাসওয়ার্ড মিলছে না</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reset Password Button */}
              <Link
                href="/password-reset-success"
                className="group flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: password !== confirmPassword || password.length === 0
                    ? "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)"
                    : "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                }}
                onClick={(e) => {
                  if (password !== confirmPassword || password.length === 0) {
                    e.preventDefault();
                  }
                }}
              >
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
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

