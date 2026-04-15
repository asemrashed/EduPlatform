'use client';

import { useState, useEffect, useRef } from 'react';
import { LuGraduationCap as GraduationCap, LuMessageCircle as MessageCircle } from 'react-icons/lu';;

interface Feature {
  id: number;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Digital Notes",
    description: "Digital Notes"
  },
  {
    id: 2,
    title: "Live Interactive Classes",
    description: "Live Interactive Classes"
  },
  {
    id: 3,
    title: "In-depth explanations",
    description: "In-depth explanations"
  },
  {
    id: 4,
    title: "Individual Support",
    description: "Individual Support"
  },
  {
    id: 5,
    title: "Tests",
    description: "Tests"
  },
  {
    id: 6,
    title: "Class Recordings",
    description: "Class Recordings"
  },
  {
    id: 7,
    title: "Focused Past Paper Practice",
    description: "Focused Past Paper Practice"
  },
  {
    id: 8,
    title: "Homework",
    description: "Homework"
  }
];

export default function PhysicsClassesSection() {
  const [activeFeature, setActiveFeature] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll detection and active feature update
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if section is in viewport
      const sectionInView = scrollTop + windowHeight > sectionTop && scrollTop < sectionTop + sectionHeight;

      if (sectionInView) {
        setIsScrolling(true);
        
        // Find which feature is most visible
        featureRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const isVisible = rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2;
            
            if (isVisible) {
              setActiveFeature(features[index].id);
            }
          }
        });
      }

      // Reset scrolling state after a delay
      setTimeout(() => setIsScrolling(false), 150);
    };

    // Throttled scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, []);

  // Intersection Observer for more precise detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featureRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setActiveFeature(features[index].id);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleFeatureClick = (featureId: number) => {
    setActiveFeature(featureId);
    const targetRef = featureRefs.current[featureId - 1];
    if (targetRef) {
      targetRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <div 
      ref={sectionRef}
      className="bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-16 lg:py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #90CAF9 0%, #BBDEFB 25%, #E3F2FD 50%, #F3E5F5 75%, #90CAF9 100%)'
      }}
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
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .feature-card {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .feature-card:nth-child(1) { animation-delay: 0ms; }
        .feature-card:nth-child(2) { animation-delay: 100ms; }
        .feature-card:nth-child(3) { animation-delay: 200ms; }
        .feature-card:nth-child(4) { animation-delay: 300ms; }
        .feature-card:nth-child(5) { animation-delay: 400ms; }
        .feature-card:nth-child(6) { animation-delay: 500ms; }
        .feature-card:nth-child(7) { animation-delay: 600ms; }
        .feature-card:nth-child(8) { animation-delay: 700ms; }
        
        .active-point {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .feature-card:hover {
          animation: float 3s ease-in-out infinite;
        }
        
        .wavy-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-20 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      {/* Decorative Background */}
      <div className="absolute inset-0 wavy-bg opacity-30"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-blue-200/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-200/15 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-pink-200/20 rounded-full blur-xl"></div>
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 lg:mb-20 relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight">
          Join our Physics Classes!
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed max-w-4xl mx-auto mb-8">
          for May June 2025 CAIES O Level / IGCSE (5054/0625) | AS & A Level Physics (9702)
        </p>
        
        {/* Register Button */}
        <button className="inline-flex items-center space-x-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-yellow-300 hover:border-yellow-400">
          <GraduationCap className="w-6 h-6" />
          <span className="text-lg">Register Now</span>
        </button>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 lg:gap-2">
          {/* Left Side - Timeline Numbers */}
          <div className="lg:col-span-3 flex lg:flex-col justify-center lg:justify-start items-center lg:items-start">
            <div className="flex lg:flex-col items-center lg:items-start w-full">
              {features.map((feature, index) => (
                <div
                  key={`${feature.id}-${index}`}
                  className="relative flex items-center lg:items-start w-full"
                  style={{
                    height: '60px', // Reduced height to match closer spacing
                    marginBottom: index < features.length - 1 ? '0' : '0'
                  }}
                >
                  {/* Timeline Circle - positioned to align with top of content cards */}
                  <button
                    onClick={() => handleFeatureClick(feature.id)}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform hover:scale-110 ${
                      activeFeature === feature.id
                        ? 'bg-yellow-400 text-gray-900 shadow-lg active-point scale-110'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-gray-800 shadow-md hover:shadow-lg'
                    } ${isScrolling ? 'transition-all duration-300' : ''}`}
                    style={{
                      boxShadow: activeFeature === feature.id
                        ? '0 8px 25px rgba(0,0,0,0.15), 0 0 0 4px rgba(255,255,255,0.8)'
                        : '0 4px 15px rgba(0,0,0,0.1)',
                      position: 'absolute',
                      top: '0px', // Align with top of content cards
                      left: '160px'
                    }}
                  >
                    {feature.id}
                    {activeFeature === feature.id && (
                      <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="lg:col-span-9">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={`${feature.id}-${index}`}
                  ref={(el) => { featureRefs.current[index] = el; }}
                  className={`feature-card relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-4 lg:p-6 border border-white/50 hover:border-blue-200/50 ${
                    activeFeature === feature.id 
                      ? 'ring-4 ring-green-200/50 bg-green-50 shadow-2xl scale-105' 
                      : 'hover:scale-102'
                  } ${isScrolling ? 'transition-all duration-300' : ''}`}
                  style={{
                    background: activeFeature === feature.id 
                      ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 50%, #a7f3d0 75%, #f0fdf4 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #ffffff 100%)',
                    boxShadow: activeFeature === feature.id
                      ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.1)'
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div className="relative z-10">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  
                  {/* Active Indicator */}
                  {activeFeature === feature.id && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
