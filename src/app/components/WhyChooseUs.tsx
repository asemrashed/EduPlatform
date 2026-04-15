"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { WhyChooseUsContent } from "@/constants/whyChooseUsContent";
import { defaultWhyChooseUsContent } from "@/constants/whyChooseUsContent";
import { htmlToPlainText } from "@/lib/utils";

interface WhyChooseUsProps {
  initialContent?: WhyChooseUsContent;
}

// Icon components based on iconType
const IconRenderer = ({ iconType }: { iconType: 'money' | 'instructor' | 'flexible' | 'community' }) => {
  switch (iconType) {
    case 'money':
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 7C8 6.44772 8.44772 6 9 6H15C15.5523 6 16 6.44772 16 7V9C16 9.55228 15.5523 10 15 10H9C8.44772 10 8 9.55228 8 9V7Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M8 10V16C8 17.1046 8.89543 18 10 18H14C15.1046 18 16 17.1046 16 16V10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M12 8V10M12 14V16M12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12H13C13.5523 12 14 12.4477 14 13C14 13.5523 13.5523 14 13 14H12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9 7L10 6L12 6L14 6L15 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'instructor':
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="2.5" stroke="white" strokeWidth="2" fill="none" />
          <path
            d="M6 18V16C6 14.9391 6.42143 13.9217 7.17157 13.1716C7.92172 12.4214 8.93913 12 10 12H14C15.0609 12 16.0783 12.4214 16.8284 13.1716C17.5786 13.9217 18 14.9391 18 16V18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <rect x="15" y="5" width="5" height="6" rx="0.5" stroke="white" strokeWidth="2" fill="none" />
          <path d="M15 8H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 6.5L17 7.5L18 6L19 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'flexible':
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect x="7" y="9" width="10" height="7" rx="0.5" stroke="white" strokeWidth="2" fill="none" />
          <path
            d="M9 11H15M9 13H13"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <rect x="9" y="5" width="2" height="4" rx="0.3" stroke="white" strokeWidth="1.5" fill="none" />
          <rect x="12" y="5" width="2" height="4" rx="0.3" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="7" r="1.5" stroke="white" strokeWidth="1.5" fill="none" />
          <path
            d="M8 16L10 18L12 16"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'community':
      return (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="9" r="2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="15" cy="9" r="2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="12" cy="7" r="1.5" stroke="white" strokeWidth="2" fill="none" />
          <path
            d="M5 18V16C5 14.9391 5.42143 13.9217 6.17157 13.1716C6.92172 12.4214 7.93913 12 9 12H15C16.0609 12 17.0783 12.4214 17.8284 13.1716C18.5786 13.9217 19 14.9391 19 16V18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M9 11L12 9L15 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
};

export default function WhyChooseUs({ initialContent }: WhyChooseUsProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [whyChooseUsContent, setWhyChooseUsContent] = useState<WhyChooseUsContent>(initialContent || defaultWhyChooseUsContent);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchWhyChooseUsContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.whyChooseUs) {
              setWhyChooseUsContent(data.data.whyChooseUs);
            }
          }
        } catch (error) {
          console.error('Error fetching why choose us content:', error);
        }
      };
      fetchWhyChooseUsContent();
    }
    setIsLoaded(true);
  }, [initialContent]);

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Column */}
          <div className="w-full lg:w-1/2">
            {/* Why Choose Us Button */}
            <div
              className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.1s",
                fontFamily: "var(--font-bengali), sans-serif",
                backgroundColor: whyChooseUsContent.label.backgroundColor,
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
              <span className="text-xs font-semibold text-white">{whyChooseUsContent.label.text}</span>
            </div>

            {/* Main Heading */}
            <h2
              className={`mb-6 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.3s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <span style={{ color: whyChooseUsContent.titleColors.part1 }}>{whyChooseUsContent.title.part1}</span>{" "}
              <span style={{ color: whyChooseUsContent.titleColors.part2 }}>{whyChooseUsContent.title.part2}</span>{" "}
              <span style={{ color: whyChooseUsContent.titleColors.part3 }}>{whyChooseUsContent.title.part3}</span>{" "}
              <span style={{ color: whyChooseUsContent.titleColors.part4 }}>{whyChooseUsContent.title.part4}</span>{" "}
              <span style={{ color: whyChooseUsContent.titleColors.part5 }}>{whyChooseUsContent.title.part5}</span>
            </h2>

            {/* Description */}
            <p
              className={`mb-8 text-base leading-relaxed text-gray-600 md:text-lg ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.5s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              {htmlToPlainText(whyChooseUsContent.description)}
            </p>

            {/* Image */}
            <div
              className={`relative h-52 w-full overflow-hidden rounded-2xl md:h-64 lg:h-72 ${
                isLoaded ? "animate-fade-in-scale" : "animate-on-load"
              }`}
              style={{ animationDelay: "0.7s" }}
            >
              <Image
                src={whyChooseUsContent.image}
                alt="Expert instructors teaching"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {whyChooseUsContent.features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`group relative overflow-hidden rounded-2xl bg-white p-6 pb-8 transition-all hover:shadow-2xl ${
                    isLoaded ? "animate-fade-in-up" : "animate-on-load"
                  }`}
                  style={{
                    animationDelay: `${0.3 + index * 0.1}s`,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                    minHeight: "280px",
                  }}
                >
                  {/* Decorative Wavy Lines - Top Right */}
                  <div className="absolute right-0 top-0 z-0 overflow-hidden">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 100 100"
                      fill="none"
                      className="opacity-40"
                    >
                      <path
                        d="M0 50 Q25 25, 50 50 T100 50"
                        stroke="#FF6B35"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 60 Q25 35, 50 60 T100 60"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Icon with Gradient Background */}
                  <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-full mx-auto">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #FFB84D 0%, #FF8C42 50%, #FF6B35 100%)",
                      }}
                    />
                    <div className="relative z-10 flex items-center justify-center">
                      <IconRenderer iconType={feature.iconType} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="relative z-10 mb-3 text-center text-xl font-bold text-[#1E3A8A]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {feature.titleBn}
                  </h3>

                  {/* Description */}
                  <p
                    className="relative z-10 text-center text-sm leading-relaxed text-gray-600"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {htmlToPlainText(feature.descriptionBn)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
