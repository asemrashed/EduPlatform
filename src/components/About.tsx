"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function About() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Side - Images */}
          <div className="relative w-full lg:w-1/2">
            {/* Main Image Cluster */}
            <div className="relative h-[500px] md:h-[600px] lg:h-[650px]">
              {/* Left Circle - Collaboration Scene */}
              <div
                className={`absolute left-0 top-8 z-10 aspect-square w-full max-w-[380px] overflow-hidden rounded-full shadow-2xl md:max-w-[420px] lg:max-w-[450px] ${
                  isLoaded ? "animate-fade-in-scale" : "animate-on-load"
                }`}
                style={{ animationDelay: "0.2s" }}
              >
                <Image
                  src="https://live.themewild.com/edubo/assets/img/about/01.jpg"
                  alt="Team collaboration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Right Circle - Young Woman */}
              <div
                className={`absolute bottom-0 right-0 z-20 aspect-square w-64 overflow-hidden rounded-full border-4 border-white shadow-2xl md:w-72 lg:w-80 ${
                  isLoaded ? "animate-fade-in-scale" : "animate-on-load"
                }`}
                style={{ animationDelay: "0.4s" }}
              >
                <Image
                  src="https://live.themewild.com/edubo/assets/img/about/02.jpg"
                  alt="Student learning"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 200px, 300px"
                />
              </div>

              {/* Connecting Curve Line - connects bottom edges */}
              <svg
                className="absolute bottom-8 left-1/4 z-0 hidden h-32 w-2/3 text-purple-400 md:block lg:h-40"
                viewBox="0 0 200 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M20 80 Q60 60, 100 50 T180 80"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.7"
                />
              </svg>
            </div>

            {/* Experience Box - Oval shape in top right */}
            <div
              className={`absolute right-0 top-0 z-30 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#EC4899] px-6 py-4 shadow-xl md:px-8 md:py-5 lg:px-10 lg:py-6 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.6s",
                borderRadius: "9999px",
                aspectRatio: "2.5/1",
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                  ৩০+
                </div>
                <div
                  className="mt-1 text-xs font-semibold text-white md:text-sm lg:text-base"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  বছরের অভিজ্ঞতা
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="w-full lg:w-1/2">
            {/* About Us Label */}
            <div
              className={`mb-4 inline-flex items-center gap-3 rounded-full bg-[#A855F7] px-5 py-2.5 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.1s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              {/* White circular icon with lightbulb */}
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#A855F7]"
                >
                  {/* Lightbulb */}
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M9 21H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Radiating lines */}
                  <path
                    d="M3 5L5 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 5L19 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 13L5 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 13L19 15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white">আমাদের সম্পর্কে</span>
            </div>

            {/* Main Heading */}
            <h2
              className={`mb-6 text-3xl font-bold leading-tight text-[#1E3A8A] md:text-4xl lg:text-5xl ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.3s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              আপনি{" "}
              <span className="text-[#10B981]">শিখতে</span> চান বা{" "}
              <span className="text-[#A855F7]">শেয়ার</span> করতে চান যা আপনি জানেন
            </h2>

            {/* Paragraph */}
            <p
              className={`mb-8 text-base leading-relaxed text-gray-600 md:text-lg ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.5s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              Lorem Ipsum-এর অনেক বৈচিত্র্য পাওয়া যায়, কিন্তু বেশিরভাগই কোনো না কোনোভাবে পরিবর্তিত হয়েছে, হাস্যরসের কারণে, বা এলোমেলো শব্দ যা একেবারেই দেখতে ভালো লাগে না।
            </p>

            {/* Feature Cards */}
            <div
              className={`mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              {/* Flexible Learning Card */}
              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[#7B2CBF]"
                  >
                    {/* Screen/Monitor */}
                    <rect
                      x="4"
                      y="3"
                      width="12"
                      height="9"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    {/* Play button inside screen */}
                    <path
                      d="M8 6L11 7.5L8 9V6Z"
                      fill="currentColor"
                    />
                    {/* Person */}
                    <circle cx="18" cy="7" r="2" fill="currentColor" />
                    <path
                      d="M18 9V11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    {/* Book */}
                    <path
                      d="M5 14L7 15L9 14V18H5V14Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 15V18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className="mb-2 text-lg font-bold text-gray-800"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    নমনীয় শেখা
                  </h3>
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    আমাদের রাউন্ড শো-এর একটি দেখুন
                  </p>
                </div>
              </div>

              {/* 24/7 Live Support Card */}
              <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[#7B2CBF]"
                  >
                    {/* Headset */}
                    <path
                      d="M12 2C9.24 2 7 4.24 7 7V12C7 14.76 9.24 17 12 17H13V20H10C9.45 20 9 20.45 9 21C9 21.55 9.45 22 10 22H14C14.55 22 15 21.55 15 21C15 20.45 14.55 20 14 20H13V17H12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 12H7C7.55 12 8 12.45 8 13V15C8 15.55 7.55 16 7 16H5C4.45 16 4 15.55 4 15V13C4 12.45 4.45 12 5 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 12H19C19.55 12 20 12.45 20 13V15C20 15.55 19.55 16 19 16H17C16.45 16 16 15.55 16 15V13C16 12.45 16.45 12 17 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Question mark */}
                    <circle cx="12" cy="9" r="1.5" fill="currentColor" />
                    <path
                      d="M12 11V13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className="mb-2 text-lg font-bold text-gray-800"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    ২৪/৭ লাইভ সহায়তা
                  </h3>
                  <p
                    className="text-sm text-gray-600"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    আমাদের রাউন্ড শো-এর একটি দেখুন
                  </p>
                </div>
              </div>
            </div>

            {/* Discover More Button */}
            <div
              className={isLoaded ? "animate-fade-in-up" : "animate-on-load"}
              style={{ animationDelay: "0.9s" }}
            >
              <button
                className="group flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-xl hover:scale-105 md:px-8 md:py-3.5"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                <span>আরও জানুন</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


