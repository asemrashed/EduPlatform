'use client';

import PageSection from "./PageSection";
import { htmlToPlainText } from '@/lib/utils';

interface WelcomeSectionProps {
  title: string;
  description: string;
  className?: string;
}

const WelcomeSection = ({ 
  title, 
  description, 
  className = '' 
}: WelcomeSectionProps) => {
  return (
    <PageSection 
      className={`mb-2 sm:mb-4 bg-transparent border-0 shadow-none p-0 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <div className="w-1 h-6 sm:h-8 rounded-full" style={{
          background: "linear-gradient(to bottom, #EC4899 0%, #A855F7 100%)",
        }}></div>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent" style={{
            backgroundImage: "linear-gradient(to right, #1E3A8A, #7B2CBF, #A855F7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm">{htmlToPlainText(description)}</p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#EC4899' }}></div>
          <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: '#A855F7' }}></div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#7B2CBF' }}></div>
        </div>
      </div>
    </PageSection>
  );
};

export default WelcomeSection;
