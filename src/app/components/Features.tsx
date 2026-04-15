"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Features() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      id: 1,
      title: "Flexible Learning",
      titleBengali: "নমনীয় শেখা",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          {/* Two people at table with lightbulb */}
          <circle cx="9" cy="9" r="2" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="15" cy="9" r="2" stroke="white" strokeWidth="2" fill="none" />
          <path
            d="M5 18V16C5 14.9391 5.42143 13.9217 6.17157 13.1716C6.92172 12.4214 7.93913 12 9 12H15C16.0609 12 17.0783 12.4214 17.8284 13.1716C18.5786 13.9217 19 14.9391 19 16V18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Table */}
          <rect x="6" y="14" width="12" height="2" rx="0.5" stroke="white" strokeWidth="1.5" fill="none" />
          {/* Lightbulb above */}
          <path
            d="M12 4C10.34 4 9 5.34 9 7C9 8.66 10.34 10 12 10C13.66 10 15 8.66 15 7C15 5.34 13.66 4 12 4Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M12 10V12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 12H14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      description:
        "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBengali:
        "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
    },
    {
      id: 2,
      title: "Supportive Community",
      titleBengali: "সহায়ক সম্প্রদায়",
      icon: (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          {/* Three people standing together */}
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
          {/* Connection lines */}
          <path d="M9 11L12 9L15 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      ),
      description:
        "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBengali:
        "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
    },
  ];

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left Side - Image */}
          <div className="w-full lg:w-1/2">
            <div
              className={`relative h-80 w-full overflow-hidden rounded-2xl md:h-96 lg:h-[500px] ${
                isLoaded ? "animate-fade-in-scale" : "animate-on-load"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <Image
                src="https://live.themewild.com/edubo/assets/img/choose/01.jpg"
                alt="Collaborative learning environment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Right Side - Two Feature Cards */}
          <div className="flex w-full flex-col gap-6 lg:w-1/2">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group relative overflow-hidden rounded-2xl bg-white p-6 transition-all hover:shadow-2xl ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{
                  animationDelay: `${0.3 + index * 0.1}s`,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                {/* Icon with Orange Circle */}
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #FFB84D 0%, #FF8C42 50%, #FF6B35 100%)",
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center">{feature.icon}</div>
                </div>

                {/* Title */}
                <h3
                  className="mb-3 text-xl font-bold text-[#1E3A8A]"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {feature.titleBengali}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed text-gray-600"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {feature.descriptionBengali}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

