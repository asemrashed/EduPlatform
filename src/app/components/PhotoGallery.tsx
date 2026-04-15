"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LuImage } from "react-icons/lu";
import type { PhotoGalleryContent } from "@/constants/photoGalleryContent";
import { defaultPhotoGalleryContent } from "@/constants/photoGalleryContent";

interface PhotoGalleryProps {
  initialContent?: PhotoGalleryContent;
}

export default function PhotoGallery({ initialContent }: PhotoGalleryProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [galleryContent, setGalleryContent] = useState<PhotoGalleryContent>(initialContent || defaultPhotoGalleryContent);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchGalleryContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.photoGallery) {
              setGalleryContent(data.data.photoGallery);
            }
          }
        } catch (error) {
          console.error('Error fetching photo gallery content:', error);
        }
      };
      fetchGalleryContent();
    }
  }, [initialContent]);

  return (
    <section className="relative bg-white py-20">
      <div className="w-full">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16 mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Gallery Badge */}
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
              backgroundColor: galleryContent.label.backgroundColor,
            }}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
              <LuImage className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <span className="text-xs font-semibold text-white">{galleryContent.label.text}</span>
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
            <span style={{ color: galleryContent.titleColors.part1 }}>{galleryContent.title.part1}</span>{" "}
            {galleryContent.titleColors.part2 === 'gradient' ? (
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: galleryContent.gradientColors?.via
                    ? `linear-gradient(to right, ${galleryContent.gradientColors.from}, ${galleryContent.gradientColors.via}, ${galleryContent.gradientColors.to})`
                    : `linear-gradient(to right, ${galleryContent.gradientColors?.from || '#A855F7'}, ${galleryContent.gradientColors?.to || '#10B981'})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {galleryContent.title.part2}
              </span>
            ) : (
              <span style={{ color: galleryContent.titleColors.part2 }}>{galleryContent.title.part2}</span>
            )}
          </h2>
        </div>

        {/* Gallery Rows with Infinite Scroll */}
        <div className="relative w-full">
          <div className="space-y-4 md:space-y-6 overflow-hidden">
            {[0, 1, 2].map((rowIndex) => {
              // Duplicate images for seamless infinite scroll
              const duplicatedImages = [...galleryContent.images, ...galleryContent.images];
              const isReverse = rowIndex % 2 === 1; // Alternate direction for each row
              
              return (
            <div
                  key={rowIndex}
                  className="relative overflow-hidden"
                  style={{ width: '100%' }}
                >
                  <div
                    className={`flex gap-4 md:gap-6 ${
                      isReverse ? 'marquee-container-reverse' : 'marquee-container'
              }`}
              style={{
                      width: 'fit-content',
              }}
                  >
                    {duplicatedImages.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="group relative aspect-square w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] flex-shrink-0 overflow-hidden rounded-xl transition-all hover:scale-105 hover:shadow-xl"
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, (max-width: 1024px) 250px, 300px"
              />
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

