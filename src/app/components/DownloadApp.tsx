"use client";

import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import type { DownloadAppContent } from "@/constants/downloadAppContent";
import { defaultDownloadAppContent } from "@/constants/downloadAppContent";
import { htmlToPlainText } from "@/lib/utils";

interface DownloadAppProps {
  initialContent?: DownloadAppContent;
}

export default function DownloadApp({ initialContent }: DownloadAppProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadAppContent, setDownloadAppContent] = useState<DownloadAppContent>(initialContent || defaultDownloadAppContent);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchDownloadAppContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.downloadApp) {
              setDownloadAppContent(data.data.downloadApp);
            }
          }
        } catch (error) {
          console.error('Error fetching download app content:', error);
        }
      };
      fetchDownloadAppContent();
    }
  }, [initialContent]);

  return (
    <section className="relative overflow-hidden py-12 px-4 md:px-6 lg:px-8 bg-white pb-40">
  
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="download-wrap relative flex flex-col items-center gap-8 rounded-3xl backdrop-blur-sm shadow-2xl lg:flex-row lg:gap-12">
          {/* Left Side - Content */}
          <div className="w-full lg:w-1/2 ">
          <div className="lg:m-8 m-6">
                        {/* Download Our App Badge */}
            <div
              className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.1s",
                fontFamily: "var(--font-bengali), sans-serif",
                backgroundColor: downloadAppContent.label.backgroundColor,
              }}
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                <LuDownload className="w-3.5 h-3.5 text-[#A855F7]" />
              </div>
              <span className="text-xs font-semibold text-white">{downloadAppContent.label.text}</span>
            </div>

            {/* Main Title */}
            <h2
              className={`mb-4 text-2xl font-bold leading-tight md:text-3xl lg:text-4xl ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.3s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <span style={{ color: downloadAppContent.titleColors.part1 }}>{downloadAppContent.title.part1}</span>{" "}
              <span style={{ color: downloadAppContent.titleColors.part2 }}>{downloadAppContent.title.part2}</span>{" "}
              <span style={{ color: downloadAppContent.titleColors.part3 }}>{downloadAppContent.title.part3}</span>{" "}
              <span style={{ color: downloadAppContent.titleColors.part4 }}>{downloadAppContent.title.part4}</span>{" "}
              <span style={{ color: downloadAppContent.titleColors.part5 }}>{downloadAppContent.title.part5}</span>{" "}
              <span style={{ color: downloadAppContent.titleColors.part6 }}>{downloadAppContent.title.part6}</span>
              <span style={{ color: downloadAppContent.titleColors.part7 }}>{downloadAppContent.title.part7}</span>
            </h2>

            {/* Description */}
            <p
              className={`mb-6 text-sm leading-relaxed text-gray-600 md:text-base ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.5s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              {htmlToPlainText(downloadAppContent.description)}
            </p>

            {/* Download Buttons */}
            <div
              className={`flex flex-col gap-3 sm:flex-row ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.7s",
              }}
            >
              {/* Google Play Button */}
              <a
                href={downloadAppContent.buttons.googlePlay.href}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${downloadAppContent.buttons.googlePlay.gradientFrom} 0%, ${downloadAppContent.buttons.googlePlay.gradientTo} 100%)`,
                  boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5Z"
                    fill="currentColor"
                  />
                  <path
                    d="M16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.54 11.15L6.05 2.66L16.81 8.88L14.54 11.15Z"
                    fill="currentColor"
                  />
                  <path
                    d="M20.16 10.81L17.19 12L20.16 13.19C20.66 13.44 21 13.96 21 14.55V9.45C21 8.86 20.66 8.34 20.16 8.59L20.16 10.81Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{downloadAppContent.buttons.googlePlay.text}</span>
              </a>

              {/* App Store Button */}
              <a
                href={downloadAppContent.buttons.appStore.href}
                className="group flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
                style={{
                  background: downloadAppContent.buttons.appStore.gradientVia
                    ? `linear-gradient(135deg, ${downloadAppContent.buttons.appStore.gradientFrom} 0%, ${downloadAppContent.buttons.appStore.gradientVia} 50%, ${downloadAppContent.buttons.appStore.gradientTo} 100%)`
                    : `linear-gradient(135deg, ${downloadAppContent.buttons.appStore.gradientFrom} 0%, ${downloadAppContent.buttons.appStore.gradientTo} 100%)`,
                  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.4)",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.05 20.28C16.45 20.64 15.8 20.74 15.12 20.58C14.44 20.42 13.88 20.05 13.45 19.47C13.02 18.89 12.8 18.2 12.8 17.4C12.8 16.6 13.02 15.91 13.45 15.33C13.88 14.75 14.44 14.38 15.12 14.22C15.8 14.06 16.45 14.16 17.05 14.52C17.65 14.88 18.08 15.4 18.35 16.08C18.62 16.76 18.75 17.52 18.75 18.36C18.75 19.2 18.62 19.96 18.35 20.64C18.08 21.32 17.65 21.84 17.05 22.2L17.05 20.28ZM6.95 20.28C6.35 20.64 5.7 20.74 5.02 20.58C4.34 20.42 3.78 20.05 3.35 19.47C2.92 18.89 2.7 18.2 2.7 17.4C2.7 16.6 2.92 15.91 3.35 15.33C3.78 14.75 4.34 14.38 5.02 14.22C5.7 14.06 6.35 14.16 6.95 14.52C7.55 14.88 7.98 15.4 8.25 16.08C8.52 16.76 8.65 17.52 8.65 18.36C8.65 19.2 8.52 19.96 8.25 20.64C7.98 21.32 7.55 21.84 6.95 22.2L6.95 20.28Z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{downloadAppContent.buttons.appStore.text}</span>
              </a>
            </div>
          </div>

          </div>

          {/* Right Side - Download Image Background */}
          <div
            className={`relative flex w-full items-center justify-center bg-cover bg-bottom bg-no-repeat lg:w-1/2 ${
              isLoaded ? "animate-fade-in-right" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.5s",
              backgroundImage: `url(${downloadAppContent.backgroundImage})`,
              minHeight: "300px",
            }}
          />
        </div>
      </div>
    </section>
  );
}
