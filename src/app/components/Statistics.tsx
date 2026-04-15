"use client";

import { useEffect, useState, useRef } from "react";
import { LuUsers, LuBookOpen, LuGraduationCap, LuAward } from "react-icons/lu";
import type { StatisticsContent } from "@/constants/statisticsContent";
import { defaultStatisticsContent } from "@/constants/statisticsContent";

interface StatisticsProps {
  initialContent?: StatisticsContent;
}

// Icon components based on iconType using react-icons
const IconRenderer = ({ iconType }: { iconType: 'students' | 'courses' | 'tutors' | 'awards' }) => {
  const iconProps = {
    size: 48,
    className: "text-white",
  };

  switch (iconType) {
    case 'students':
      return <LuUsers {...iconProps} />;
    case 'courses':
      return <LuBookOpen {...iconProps} />;
    case 'tutors':
      return <LuGraduationCap {...iconProps} />;
    case 'awards':
      return <LuAward {...iconProps} />;
    default:
      return null;
  }
};

export default function Statistics({ initialContent }: StatisticsProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [statisticsContent, setStatisticsContent] = useState<StatisticsContent>(initialContent || defaultStatisticsContent);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchStatisticsContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.statistics) {
              setStatisticsContent(data.data.statistics);
            }
          }
        } catch (error) {
          console.error('Error fetching statistics content:', error);
        }
      };
      fetchStatisticsContent();
    }
    setIsLoaded(true);
  }, [initialContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // Start countdown animation
            animateCounts();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  const animateCounts = () => {
    const targets = statisticsContent.items.map(item => parseInt(item.number));
    const durations = [2000, 2000, 2000, 2000]; // 2 seconds for each
    const steps = 60; // Number of animation steps

    targets.forEach((target, index) => {
      let currentStep = 0;
      const increment = target / steps;
      const stepDuration = durations[index] / steps;

      const timer = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(increment * currentStep), target);
        
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[index] = currentValue;
          return newCounts;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          // Ensure final value is exact
          setCounts((prev) => {
            const newCounts = [...prev];
            newCounts[index] = target;
            return newCounts;
          });
        }
      }, stepDuration);
    });
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-gradient-to-b from-white to-[#FEF9F3] py-12 px-4 md:px-6 lg:px-8">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statisticsContent.items.map((stat, index) => (
            <div
              key={stat.id}
              className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-2xl hover:scale-[1.02] md:p-8 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Decorative Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#A855F7]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              <div className="relative flex flex-col items-center text-center">
                {/* Icon with Orange Circle */}
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: "linear-gradient(135deg, #FFB84D 0%, #FF8C42 50%, #FF6B35 100%)",
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="scale-[0.7]">
                      <IconRenderer iconType={stat.iconType} />
                    </div>
                  </div>
                </div>

                {/* Number */}
                <div className="mb-2">
                  <span
                    className="text-3xl font-bold text-[#1E3A8A] md:text-4xl lg:text-5xl"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {isVisible ? counts[index] : 0}
                    <sup className="text-xl md:text-2xl lg:text-3xl">{stat.suffix}</sup>
                  </span>
                </div>

                {/* Label */}
                <p
                  className="text-sm font-semibold text-[#1E3A8A] md:text-base"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {stat.labelBengali}
                </p>

                {/* Decorative Border on Hover */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#A855F7] opacity-0 transition-opacity duration-300 group-hover:opacity-20" style={{ backgroundSize: "200% 200%" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
