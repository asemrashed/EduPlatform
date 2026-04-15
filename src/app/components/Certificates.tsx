"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { LuAward, LuBuilding } from "react-icons/lu";
import type { CertificatesContent } from "@/constants/certificatesContent";
import { defaultCertificatesContent } from "@/constants/certificatesContent";
import { htmlToPlainText } from "@/lib/utils";

interface CertificatesProps {
  initialContent?: CertificatesContent;
}

export default function Certificates({ initialContent }: CertificatesProps) {
  const [isLoaded, setIsLoaded] = useState(true);
  const [certificatesContent, setCertificatesContent] = useState<CertificatesContent>(initialContent || defaultCertificatesContent);
  const [activeLeftSlide, setActiveLeftSlide] = useState(0);
  const [activeRightSlide, setActiveRightSlide] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState<{
    title: string;
    imageUrl: string;
  } | null>(null);
  const totalPairs = Math.ceil(certificatesContent.certificates.length / 2);
  const shouldShowCarousel = totalPairs > 1;

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchCertificatesContent = async () => {
        try {
          // Add timestamp to bust cache and ensure fresh data
          const response = await fetch('/api/website-content?' + new URLSearchParams({
            _t: Date.now().toString()
          }), {
            cache: 'no-store',
            next: { revalidate: 0 }, // Always revalidate
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.certificates) {
              setCertificatesContent(data.data.certificates);
            }
          }
        } catch (error) {
          console.error('Error fetching certificates content:', error);
        }
      };
      fetchCertificatesContent();
    }
  }, [initialContent]);

  useEffect(() => {
    const leftCertificates = certificatesContent.certificates.filter((_, index) => index % 2 === 0);
    const rightCertificates = certificatesContent.certificates.filter((_, index) => index % 2 === 1);

    if (!shouldShowCarousel) {
      if (activeLeftSlide !== 0) setActiveLeftSlide(0);
      if (activeRightSlide !== 0) setActiveRightSlide(0);
      return;
    }

    if (!leftCertificates.length) {
      setActiveLeftSlide(0);
    } else if (activeLeftSlide > leftCertificates.length - 1) {
      setActiveLeftSlide(0);
    }

    if (!rightCertificates.length) {
      setActiveRightSlide(0);
    } else if (activeRightSlide > rightCertificates.length - 1) {
      setActiveRightSlide(0);
    }
  }, [certificatesContent.certificates, activeLeftSlide, activeRightSlide, shouldShowCarousel]);

  return (
    <section className="relative bg-gradient-to-b from-white to-[#FEF9F3] py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          {/* Section Label */}
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
              backgroundColor: certificatesContent.label.backgroundColor,
            }}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
              <LuAward className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <span className="text-xs font-semibold text-white">{certificatesContent.label.text}</span>
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
            <span style={{ color: certificatesContent.titleColors.part1 }}>{certificatesContent.title.part1}</span>{" "}
            {certificatesContent.titleColors.part2 === 'gradient' ? (
            <span
              className="bg-clip-text text-transparent"
              style={{
                  backgroundImage: certificatesContent.gradientColors?.via
                    ? `linear-gradient(to right, ${certificatesContent.gradientColors.from}, ${certificatesContent.gradientColors.via}, ${certificatesContent.gradientColors.to})`
                    : `linear-gradient(to right, ${certificatesContent.gradientColors?.from || '#10B981'}, ${certificatesContent.gradientColors?.to || '#A855F7'})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
                {certificatesContent.title.part2}
            </span>
            ) : (
              <span style={{ color: certificatesContent.titleColors.part2 }}>{certificatesContent.title.part2}</span>
            )}
          </h2>
        </div>

        {/* Certificates Carousel */}
        {certificatesContent.certificates.length > 0 && (
          <div className="w-full">
            {(() => {
              const leftCertificates = certificatesContent.certificates.filter((_, index) => index % 2 === 0);
              const rightCertificates = certificatesContent.certificates.filter((_, index) => index % 2 === 1);
              const carouselTracks = [
                {
                  key: "left",
                  certificates: leftCertificates,
                  activeSlide: activeLeftSlide,
                  setActiveSlide: setActiveLeftSlide,
                },
                {
                  key: "right",
                  certificates: rightCertificates,
                  activeSlide: activeRightSlide,
                  setActiveSlide: setActiveRightSlide,
                },
              ].filter((track) => track.certificates.length > 0);

              return (
                <div
                  className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl md:p-8 ${
                    isLoaded ? "animate-fade-in-up" : "animate-on-load"
                  }`}
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {carouselTracks.map((track) => {
                      const certificate = track.certificates[track.activeSlide];
                      const totalSlides = track.certificates.length;
                      const certificateImageUrl = certificate.imageUrl?.trim() || null;

                      return (
                        <div key={track.key} className="group rounded-xl border border-gray-100 p-4">
                          <div className="mb-4 text-center">
                            <h3
                              className="text-lg font-bold text-[#1E3A8A] md:text-xl"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {certificate.titleBengali}
                            </h3>
                          </div>

                          <button
                            type="button"
                            className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 shadow-inner ${
                              certificateImageUrl ? "cursor-zoom-in" : "cursor-not-allowed"
                            }`}
                            title="বড় করে দেখুন"
                            onClick={() => {
                              if (!certificateImageUrl) return;
                              setSelectedCertificate({
                                title: certificate.titleBengali,
                                imageUrl: certificateImageUrl,
                              });
                            }}
                          >
                            {certificateImageUrl ? (
                              <Image
                                src={certificateImageUrl}
                                alt={certificate.titleEnglish}
                                fill
                                className="object-contain transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-500">
                                ছবি পাওয়া যায়নি
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                          </button>

                          {certificate.description && (
                            <p
                              className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {htmlToPlainText(certificate.description)}
                            </p>
                          )}

                          {shouldShowCarousel && totalSlides > 1 && (
                            <div className="mt-6 flex items-center justify-between gap-4">
                              <button
                                type="button"
                                className="rounded-lg border border-[#A855F7]/30 px-4 py-2 text-sm font-semibold text-[#7C3AED] hover:bg-[#A855F7]/10"
                                onClick={() =>
                                  track.setActiveSlide((prev: number) =>
                                    prev === 0 ? totalSlides - 1 : prev - 1
                                  )
                                }
                              >
                                আগেরটি
                              </button>

                              <div className="flex items-center gap-2">
                                {Array.from({ length: totalSlides }).map((_, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                                      track.activeSlide === index ? "w-6 bg-[#A855F7]" : "bg-gray-300 hover:bg-gray-400"
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                    onClick={() => track.setActiveSlide(index)}
                                  />
                                ))}
                              </div>

                              <button
                                type="button"
                                className="rounded-lg border border-[#A855F7]/30 px-4 py-2 text-sm font-semibold text-[#7C3AED] hover:bg-[#A855F7]/10"
                                onClick={() =>
                                  track.setActiveSlide((prev: number) =>
                                    prev === totalSlides - 1 ? 0 : prev + 1
                                  )
                                }
                              >
                                পরবর্তী
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* About the Institution Section */}
        <div className="mt-20 bg-white p-8 rounded-2xl">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="w-full lg:w-1/2">
              <h3
                className={`mb-6 text-2xl font-bold text-[#1E3A8A] md:text-3xl lg:text-4xl ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{
                  animationDelay: "0.9s",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                {certificatesContent.about.title}
              </h3>
              
              <div
                className={`space-y-4 text-base leading-relaxed text-gray-700 md:text-lg ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{
                  animationDelay: "1.1s",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                {certificatesContent.about.description.map((paragraph, index) => (
                  <p key={index}>{htmlToPlainText(paragraph)}</p>
                ))}
              </div>
            </div>

            {/* Right Side - Director Photo */}
            <div className="w-full lg:w-1/2">
              <div
                className={`flex flex-col items-center lg:items-end ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{ animationDelay: "1.3s" }}
              >
                {/* Photo Container */}
                <div className="group relative mb-6 h-[400px] w-full max-w-[350px] md:h-[450px] md:max-w-[400px]">
                  {/* Decorative Background Gradient */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#10B981] opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-40"></div>
                  
                  {/* Main Image Container */}
                  <div className="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] p-1 shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_20px_50px_rgba(168,85,247,0.3)]">
                    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-white">
                      <Image
                        src={certificatesContent.about.imageUrl}
                        alt={certificatesContent.about.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      
                      {/* Decorative Corner Elements */}
                      <div className="absolute -left-3 -top-3 h-12 w-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] opacity-60 blur-md transition-all duration-300 group-hover:scale-150 group-hover:opacity-80"></div>
                      <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-gradient-to-br from-[#EC4899] to-[#A855F7] opacity-60 blur-md transition-all duration-300 group-hover:scale-150 group-hover:opacity-80"></div>
                      
                      {/* Inner Border Glow */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>
                  </div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -right-4 top-4 z-10 rounded-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] px-4 py-2 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <div className="flex items-center gap-2">
                      <LuBuilding className="w-4 h-4 text-white" />
                      <span className="text-xs font-semibold text-white">Team</span>
                    </div>
                  </div>
                </div>

                {/* Name and Affiliation */}
                <div className="w-full max-w-[350px] text-center lg:text-right md:max-w-[400px]">
                  <h4
                    className="mb-2 text-xl font-bold text-[#1E3A8A] md:text-2xl"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {certificatesContent.about.name}
                  </h4>
                  <p
                    className="text-base text-gray-600 md:text-lg"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {certificatesContent.about.affiliation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCertificate && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white p-3 md:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
              onClick={() => setSelectedCertificate(null)}
            >
              বন্ধ করুন
            </button>
            <div className="relative h-[70vh] w-full rounded-xl bg-gray-100 md:h-[80vh]">
              {selectedCertificate.imageUrl?.trim() ? (
                <Image
                  src={selectedCertificate.imageUrl}
                  alt={selectedCertificate.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base font-medium text-gray-500">
                  ছবি পাওয়া যায়নি
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
