"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    // Focus the last filled input or the first empty one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    setTimer(120);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    // Here you would trigger the resend OTP API call
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              fill="url(#wave-gradient-otp)"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="wave-gradient-otp" x1="0%" y1="0%" x2="100%" y2="0%">
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
            OTP যাচাইকরণ
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
              OTP যাচাইকরণ
            </span>
          </div>
        </div>
      </div>

      {/* OTP Verification Section */}
      <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12 md:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* OTP Card */}
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
              className="mb-2 text-center text-sm text-gray-600"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              আমরা আপনার মোবাইল নম্বরে একটি ৬-অঙ্কের OTP কোড পাঠিয়েছি
            </p>
            <p
              className="mb-8 text-center text-sm font-medium text-[#7B2CBF]"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              +৮৮০ ১৭XX-XXXXXX
            </p>

            {/* Info Box */}
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
                  OTP কোডটি আপনার মোবাইলে পাঠানো হয়েছে। অনুগ্রহ করে নিচের বক্সে কোডটি লিখুন।
                </p>
              </div>
            </div>

            {/* OTP Input Fields */}
            <form className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-14 w-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-2xl font-bold text-gray-800 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20 transition-all"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  />
                ))}
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                {!canResend ? (
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    OTP আবার পাঠান:{" "}
                    <span className="font-semibold text-[#7B2CBF]">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-semibold text-[#7B2CBF] hover:text-[#A855F7] transition-colors"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    OTP আবার পাঠান
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <Link
                href="/reset-password"
                className="group flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold text-white transition-all hover:shadow-lg"
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                }}
              >
                <span>যাচাই করুন</span>
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

            {/* Back Links */}
            <div className="mt-8 space-y-2 text-center">
              <Link
                href="/forgot-password"
                className="block text-sm text-gray-600 hover:text-[#7B2CBF] transition-colors"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                ← মোবাইল নম্বর পরিবর্তন করুন
              </Link>
              <p
                className="text-sm text-gray-600"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                মনে পড়ে গেছে?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#7B2CBF] hover:text-[#A855F7] transition-colors"
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

