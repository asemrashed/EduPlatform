"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LuFileText, LuUser, LuMessageSquare, LuArrowRight } from "react-icons/lu";
import type { BlogContent } from "@/constants/blogContent";
import { defaultBlogContent } from "@/constants/blogContent";
import { htmlToPlainText } from "@/lib/utils";

interface BlogProps {
  initialContent?: BlogContent;
}

export default function Blog({ initialContent }: BlogProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [blogContent, setBlogContent] = useState<BlogContent>(initialContent || defaultBlogContent);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchBlogContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.blog) {
              setBlogContent(data.data.blog);
            }
          }
        } catch (error) {
          console.error('Error fetching blog content:', error);
        }
      };
      fetchBlogContent();
    }
  }, [initialContent]);

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          {/* Blog Badge */}
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
              backgroundColor: blogContent.label.backgroundColor,
            }}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
              <LuFileText className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <span className="text-xs font-semibold text-white">{blogContent.label.text}</span>
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
            <span style={{ color: blogContent.titleColors.part1 }}>{blogContent.title.part1}</span>{" "}
            <span style={{ color: blogContent.titleColors.part2 }}>{blogContent.title.part2}</span>{" "}
            <span style={{ color: blogContent.titleColors.part3 }}>{blogContent.title.part3}</span>{" "}
            {blogContent.titleColors.part4 === 'gradient' ? (
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: blogContent.gradientColors?.via
                    ? `linear-gradient(to right, ${blogContent.gradientColors.from}, ${blogContent.gradientColors.via}, ${blogContent.gradientColors.to})`
                    : `linear-gradient(to right, ${blogContent.gradientColors?.from || '#EC4899'}, ${blogContent.gradientColors?.to || '#10B981'})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {blogContent.title.part4}
              </span>
            ) : (
              <span style={{ color: blogContent.titleColors.part4 }}>{blogContent.title.part4}</span>
            )}
          </h2>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {blogContent.posts.map((post, index) => (
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
                    <LuUser className="w-4 h-4 text-[#A855F7]" />
                    <span
                      className="font-medium text-gray-500"
                      style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    >
                      {post.authorBengali}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuMessageSquare className="w-4 h-4 text-[#A855F7]" />
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
                  className="group/btn relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                    boxShadow: "0 2px 8px rgba(236, 72, 153, 0.25)",
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  {/* Shine effect */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"></span>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center gap-2">
                    <span>{blogContent.buttonText}</span>
                    <LuArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                  </span>
                  
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

