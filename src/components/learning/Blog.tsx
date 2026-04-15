"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { htmlToPlainText } from "@/lib/utils";

export default function Blog() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const blogPosts = [
    {
      id: 1,
      image: "https://live.themewild.com/edubo/assets/img/blog/01.jpg",
      date: "Aug 20, 2025",
      author: "Alicia Davis",
      authorBengali: "অ্যালিসিয়া ডেভিস",
      comments: "2.5k",
      commentsBengali: "2.5k মন্তব্য",
      title: "There Are Many Variations Of Passages Orem Available.",
      titleBengali: "অনেক ধরনের প্যাসেজ ওরেম পাওয়া যায়।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 2,
      image: "https://live.themewild.com/edubo/assets/img/blog/02.jpg",
      date: "Aug 23, 2025",
      author: "Michael Chen",
      authorBengali: "মাইকেল চেন",
      comments: "1.8k",
      commentsBengali: "1.8k মন্তব্য",
      title: "Generator Internet Repeat Tend Word Chunk Necessary.",
      titleBengali: "জেনারেটর ইন্টারনেট পুনরাবৃত্তি টেন্ড ওয়ার্ড চাঙ্ক প্রয়োজনীয়।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 3,
      image: "https://live.themewild.com/edubo/assets/img/blog/03.jpg",
      date: "Aug 25, 2025",
      author: "Sarah Johnson",
      authorBengali: "সারা জনসন",
      comments: "3.2k",
      commentsBengali: "3.2k মন্তব্য",
      title: "Survived Only Five Centuries But Also The Leap Into.",
      titleBengali: "শুধুমাত্র পাঁচ শতাব্দী বেঁচে আছে কিন্তু লিপেও।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 4,
      image: "https://live.themewild.com/edubo/assets/img/blog/01.jpg",
      date: "Aug 28, 2025",
      author: "David Wilson",
      authorBengali: "ডেভিড উইলসন",
      comments: "1.9k",
      commentsBengali: "1.9k মন্তব্য",
      title: "Making This The First True Generator On The Internet.",
      titleBengali: "ইন্টারনেটে প্রথম সত্যিকারের জেনারেটর তৈরি করা।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
  ];

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          {/* Blog Badge */}
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full bg-[#A855F7] px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
            }}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#A855F7]"
              >
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
              </svg>
            </div>
            <span className="text-xs font-semibold text-white">আমাদের ব্লগ</span>
          </div>

          {/* Main Title */}
          <h2
            className={`text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.3s",
              fontFamily: "var(--font-bengali), sans-serif",
            }}
          >
            <span className="text-[#1E3A8A]">আমাদের সর্বশেষ</span>{" "}
            <span className="text-[#1E3A8A]">খবর</span>{" "}
            <span className="text-[#1E3A8A]">এবং</span>{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #EC4899, #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ব্লগ
            </span>
          </h2>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              className={`group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: `${0.1 * index}s`,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Blog Image */}
              <div className="relative h-64 w-full overflow-hidden rounded-t-xl p-4">
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.titleBengali}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                {/* Date Tag - Top Right */}
                <div className="absolute right-6 top-6 rounded-full bg-white px-3 py-1.5 shadow-sm">
                  <span
                    className="text-xs font-semibold text-[#A855F7]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {post.date}
                  </span>
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-6">
                {/* Author and Comments */}
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#A855F7]"
                    >
                      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className="font-medium text-gray-500"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      {post.authorBengali}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#A855F7]"
                    >
                      <path
                        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      className="font-medium text-gray-500"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      {post.commentsBengali}
                    </span>
                  </div>
                </div>

                {/* Blog Title */}
                <h3
                  className="mb-3 line-clamp-2 text-xl font-bold leading-tight text-[#1E3A8A]"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {post.titleBengali}
                </h3>

                {/* Description */}
                <p
                  className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-500"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {htmlToPlainText(post.descriptionBengali)}
                </p>

                {/* Read More Button */}
                <button
                  className="group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                    boxShadow: "0 2px 8px rgba(236, 72, 153, 0.25)",
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  <span>আরও পড়ুন</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1"
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
          ))}
        </div>
      </div>
    </section>
  );
}

