'use client';

import { useState, useEffect } from 'react';
import { LuBookOpen as BookOpen, LuVideo as Video, LuDownload as Download } from 'react-icons/lu';;

interface Resource {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Online Interactive Classes",
    description: "Join group sessions to collaborate, solve problems, and review key concepts together.",
    icon: <BookOpen className="w-8 h-8" />
  },
  {
    id: 2,
    title: "Pre Recorded Lectures",
    description: "Access high-quality video lessons to simplify complex Physics concepts for various exam boards.",
    icon: <Video className="w-8 h-8" />
  },
  {
    id: 3,
    title: "Free Resources",
    description: "Get revision notes and solved past papers to help you master Physics with ease.",
    icon: <Download className="w-8 h-8" />
  }
];

export default function LearningResourcesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById('learning-resources-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return (
      <div 
        id="learning-resources-section"
        className="bg-yellow-400 py-16 lg:py-24 relative overflow-hidden"
      >
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .resource-card {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .resource-card:nth-child(1) { animation-delay: 0ms; }
        .resource-card:nth-child(2) { animation-delay: 200ms; }
        .resource-card:nth-child(3) { animation-delay: 400ms; }
        
        .resource-card:hover {
          animation: float 3s ease-in-out infinite;
        }
        
        .wavy-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-yellow-200/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-200/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-yellow-300/20 rounded-full blur-xl"></div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 lg:mb-20 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight">
          Discover Learning Resources!
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 font-medium leading-relaxed max-w-4xl mx-auto">
          Access tools for May/June 2025 CAIE O Level, IGCSE (5054/0625), AS & A Level Physics (9702).
        </p>
      </div>

      {/* Resources Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {resources.map((resource, index) => (
            <div
              key={resource.id}
              className={`resource-card relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-6 lg:p-8 border border-white/50 hover:border-yellow-200/50 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 25%, #fef3c7 50%, #fde68a 75%, #ffffff 100%)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full transform translate-x-4 -translate-y-4"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-yellow-300/30 to-amber-200/30 rounded-full transform -translate-x-2 translate-y-2"></div>
              
              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="text-white">
                    {resource.icon}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  {resource.title}
                </h3>
                
                {/* Separator Line */}
                <div className="w-12 h-0.5 bg-gray-900 mb-4"></div>
                
                <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
                  {resource.description}
                </p>
              </div>
              
              {/* Subtle Border Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-200/20 via-orange-200/20 to-amber-200/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
