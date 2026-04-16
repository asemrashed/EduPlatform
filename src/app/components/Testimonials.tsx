"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import VideoWatermark from "@/components/VideoWatermark";
import { safeDate } from "@/lib/safe";

interface Review {
  _id: string;
  displayStudentName?: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: string;
  };
  rating: number;
  reviewType?: "text" | "video";
  title?: string;
  comment?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  displayOrder?: number;
  createdAt: string;
  isApproved?: boolean;
  isPublic?: boolean;
  isDisplayed?: boolean;
}

interface TestimonialItem {
  id: string;
  type: "video" | "text";
  name: string;
  nameBengali: string;
  roleBengali: string;
  avatar: string;
  rating: number;
  quote: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  displayOrder: number;
}

const DEFAULT_TESTIMONIAL_AVATAR =
  "https://live.themewild.com/edubo/assets/img/testimonial/01.jpg";

const isRenderableImageUrl = (url?: string) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();

    // Direct image hosts commonly used in this project.
    if (host === "i.ibb.co" || host === "i.ibb.co.com") return true;

    // Generic image URL check by extension.
    return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(path);
  } catch {
    return false;
  }
};

const isYouTubeUrl = (url?: string) => {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be)/i.test(url);
};

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedId = parts[0] === "embed" ? parts[1] : null;
      return embedId ? `https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0` : null;
    }
  } catch {
    return null;
  }

  return null;
};

const getYouTubeThumbnailUrl = (url?: string) => {
  if (!url) return null;
  try {
    const parsed = new URL(url.trim());

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedId = parts[0] === "embed" ? parts[1] : null;
      return embedId ? `https://img.youtube.com/vi/${embedId}/hqdefault.jpg` : null;
    }
  } catch {
    return null;
  }

  return null;
};

export default function Testimonials() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // TODO: migrate to service layer (Phase 9)
      const response = await fetch(
        "/api/course-reviews?limit=1000&public=true&sortBy=displayOrder&sortOrder=asc",
        { cache: "no-store" }
      );

      if (!response.ok) return;

      const data = await response.json();
      const reviewsData: Review[] = data.data?.reviews || data.reviews || [];

      const displayedReviews = reviewsData
        .filter(
          (review) =>
            review.isDisplayed === true && review.isApproved === true && review.isPublic === true
        )
        .sort((a, b) => {
          const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          const createdAtA = safeDate(a.createdAt);
          const createdAtB = safeDate(b.createdAt);
          return (createdAtA?.getTime() ?? 0) - (createdAtB?.getTime() ?? 0);
        })
        .slice(0, 8);

      const mapped: TestimonialItem[] = displayedReviews.map((review, index): TestimonialItem => {
        const resolvedName =
          review.displayStudentName?.trim() ||
          (review.student.role === "admin"
            ? "শিক্ষার্থী"
            : `${review.student.firstName} ${review.student.lastName}`);

        return {
          id: review._id,
          type: review.reviewType === "video" && review.videoUrl ? "video" : "text",
          name: resolvedName,
          nameBengali: resolvedName,
          roleBengali: "শিক্ষার্থী",
          avatar: isRenderableImageUrl(review.student.avatar)
            ? (review.student.avatar as string)
            : DEFAULT_TESTIMONIAL_AVATAR,
          rating: review.rating,
          quote: review.comment || review.title || "",
          videoUrl: review.videoUrl || undefined,
          thumbnail:
            (isRenderableImageUrl(review.videoThumbnail)
              ? (review.videoThumbnail as string)
              : null) ||
            getYouTubeThumbnailUrl(review.videoUrl) ||
            (isRenderableImageUrl(review.student.avatar)
              ? (review.student.avatar as string)
              : DEFAULT_TESTIMONIAL_AVATAR),
          duration: "2:35",
          displayOrder: review.displayOrder ?? index + 1,
        };
      });

      setTestimonials(mapped);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && testimonials.length === 0) return null;

  return (
    <section className="ts-bg bg-white relative overflow-hidden py-20 px-4 md:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full bg-[#A855F7] px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
            }}
          >
            <span className="text-xs font-semibold text-white">টেস্টিমোনিয়াল</span>
          </div>

          <h2
            className={`text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.3s",
              fontFamily: "var(--font-bengali), sans-serif",
            }}
          >
            <span className="text-[#1E3A8A]">আমাদের ক্লায়েন্টরা</span>{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(to right, #14B8A6, #EC4899, #A855F7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              আমাদের সম্পর্কে কী বলে
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((item, index) => (
              <div
                key={item.id}
                className={`h-full ${isLoaded ? "animate-fade-in-up" : "animate-on-load"}`}
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div
                  className="relative h-full rounded-xl p-[2px]"
                  style={{ background: "linear-gradient(to right, #A855F7, #EC4899)" }}
                >
                  {item.type === "video" && item.videoUrl ? (
                    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl">
                      <div className="relative aspect-video w-full overflow-hidden bg-gray-900 flex-shrink-0">
                        {playingVideo === item.id ? (
                          <>
                            {isYouTubeUrl(item.videoUrl) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(item.videoUrl) || undefined}
                                title={`Video review by ${item.nameBengali}`}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={item.videoUrl}
                                controls
                                autoPlay
                                className="h-full w-full object-contain"
                                onEnded={() => setPlayingVideo(null)}
                              >
                                Your browser does not support the video tag.
                              </video>
                            )}
                            <VideoWatermark />
                          </>
                        ) : (
                          <>
                            <Image
                              src={item.thumbnail || item.avatar}
                              alt={`Video review by ${item.nameBengali}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            <button
                              onClick={() => setPlayingVideo(item.id)}
                              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-all hover:bg-black/40"
                            >
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all hover:scale-110">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="ml-1 text-[#A855F7]">
                                  <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                                </svg>
                              </div>
                            </button>
                          </>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              width="16"
                              height="16"
                              viewBox="0 0 20 20"
                              fill="none"
                              className={star <= item.rating ? "text-yellow-400" : "text-gray-300"}
                            >
                              <path d="M10 1L12.5 7.5L19 8.5L14 13L15.5 19.5L10 16L4.5 19.5L6 13L1 8.5L7.5 7.5L10 1Z" fill="currentColor" />
                            </svg>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 rounded-lg bg-[#FFE5D9] p-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md">
                            <Image src={item.avatar} alt={item.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-[#1E3A8A]">{item.nameBengali}</h4>
                            <p className="text-xs font-medium text-[#FF6B35]">{item.roleBengali}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
                      <div className="mb-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            className={star <= item.rating ? "text-yellow-400" : "text-gray-300"}
                          >
                            <path d="M10 1L12.5 7.5L19 8.5L14 13L15.5 19.5L10 16L4.5 19.5L6 13L1 8.5L7.5 7.5L10 1Z" fill="currentColor" />
                          </svg>
                        ))}
                      </div>
                      <p className="mb-6 text-sm leading-relaxed text-gray-700 line-clamp-4 flex-1">{item.quote}</p>
                      <div className="flex items-center gap-3 rounded-lg p-3 mt-auto bg-[#FFE5D9]">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-md">
                          <Image src={item.avatar} alt={item.name} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-[#1E3A8A]">{item.nameBengali}</h4>
                          <p className="text-xs font-medium text-[#FF6B35]">{item.roleBengali}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
