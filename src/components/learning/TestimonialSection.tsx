'use client';

import { useState, useEffect, useRef } from 'react';
import { LuChevronLeft as ChevronLeft, LuChevronRight as ChevronRight } from 'react-icons/lu';;

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  school: string;
  grade: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "The classes helped me by clearing up my concepts and learning different ways to solve past paper questions. The explanations were easy, concise, and clear. I even got individual support whenever needed. These classes helped me get closer to achieving my desired grade!",
    name: "Abia Siddiqui",
    school: "BCP, Karachi",
    grade: "AS Level - Grade A"
  },
  {
    id: 2,
    quote: "After taking classes, with Sir Talha, I began to grasp concepts much more clearly as his way of explaining is precise and to the point. I began to understand and enjoy doing physics which was a huge accomplishment for me! Sir Talha always cleared our doubts on the spot and I now feel confident in my physics concepts. I received a stellar grade because of Sir Talha!",
    name: "Marzia Mehzabin",
    school: "Westminster School, Dubai",
    grade: "AS Level - Grade A"
  },
  {
    id: 3,
    quote: "The classes and the resources provided were very helpful, as I was always weak in physics but Sir Talha's lectures and explanations contributed to me getting an A. If I had any doubts, Sir Talha always cleared them out during our online classes.",
    name: "Hiba Sharjeel",
    school: "PISES, Dubai",
    grade: "AS Level - Grade A"
  },
  {
    id: 4,
    quote: "Sir Talha's teaching methods are exceptional. His clear explanations and patient approach helped me understand complex physics concepts. The interactive sessions and practical examples made learning enjoyable and effective.",
    name: "Ahmed Hassan",
    school: "Karachi Grammar School",
    grade: "A Level - Grade A*"
  },
  {
    id: 5,
    quote: "I was struggling with physics until I joined Sir Talha's classes. His systematic approach and step-by-step problem-solving techniques transformed my understanding. I went from failing to achieving an A grade!",
    name: "Fatima Ali",
    school: "Beaconhouse School System",
    grade: "AS Level - Grade A"
  }
];

export default function TestimonialSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragCurrent, setDragCurrent] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered]);

  // LuKeyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global mouse up handler for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
        setDragCurrent(null);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStart) {
        setDragCurrent(e.clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging, dragStart]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setIsAutoPlaying(false); // Stop auto-play when user interacts
    
    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Touch/swipe functionality for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide(); // Swipe left = next slide (items come from left)
    } else if (isRightSwipe) {
      prevSlide(); // Swipe right = previous slide (items come from right)
    }
  };

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragCurrent(e.clientX);
    setIsAutoPlaying(false); // Stop auto-play when user drags
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    setDragCurrent(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent) return;
    
    const distance = dragStart - dragCurrent;
    const isLeftDrag = distance > 50;
    const isRightDrag = distance < -50;

    if (isLeftDrag) {
      nextSlide(); // Drag left = next slide (items come from left)
    } else if (isRightDrag) {
      prevSlide(); // Drag right = previous slide (items come from right)
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };


  // Get visible testimonials (3 at a time)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentSlide + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="bg-yellow-400 py-16 lg:py-24 relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
        
        .testimonial-card {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .testimonial-card:nth-child(1) {
          animation-delay: 0ms;
        }
        
        .testimonial-card:nth-child(2) {
          animation-delay: 50ms;
        }
        
        .testimonial-card:nth-child(3) {
          animation-delay: 100ms;
        }
        
        .testimonial-card:hover {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .drag-indicator {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 40px;
          background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
          border-radius: 2px;
          opacity: 0.8;
          z-index: 30;
          transition: all 0.2s ease;
        }
        
        .drag-indicator.left {
          left: 20px;
        }
        
        .drag-indicator.right {
          right: 20px;
        }
      `}</style>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20 lg:mb-24 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-32 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-24 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-30"></div>
        
        <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 mb-6 lg:mb-8 leading-tight relative">
          <span className="relative z-10">The results I have helped create!</span>
          {/* Text Shadow Effect */}
          <div className="absolute inset-0 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-200 opacity-20 transform translate-x-1 translate-y-1 -z-10">
            The results I have helped create!
          </div>
        </h2>
        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-800 font-medium leading-relaxed max-w-4xl mx-auto relative">
          Hear what my students say about their learning experience with me.
        </p>
      
      </div>

      {/* Testimonial Carousel */}
      <div 
        className={`max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative transition-all duration-300 ${
          isTransitioning ? 'opacity-90' : 'opacity-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className={`absolute -left-1 md:-left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200 hover:border-gray-300 ${
            isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>

        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className={`absolute -right-1 md:-right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200 hover:border-gray-300 ${
            isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
          }`}
          aria-label="Next testimonials"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
        </button>


        {/* Drag Indicators */}
        {isDragging && dragStart && dragCurrent && (
          <>
            {dragCurrent < dragStart - 20 && (
              <div className="drag-indicator left"></div>
            )}
            {dragCurrent > dragStart + 20 && (
              <div className="drag-indicator right"></div>
            )}
          </>
        )}

        {/* Testimonial Cards */}
        <div 
          ref={carouselRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 transition-opacity duration-300 ${
            isTransitioning ? 'opacity-70' : 'opacity-100'
          } ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            userSelect: isDragging ? 'none' : 'auto',
            WebkitUserSelect: isDragging ? 'none' : 'auto',
            MozUserSelect: isDragging ? 'none' : 'auto',
            msUserSelect: isDragging ? 'none' : 'auto' as any,
            transform: isDragging && dragStart && dragCurrent 
              ? `translateX(${(dragCurrent - dragStart) * 0.1}px)` 
              : 'translateX(0)',
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
        >
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${currentSlide}`}
              className="testimonial-card relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 p-8 lg:p-10 overflow-hidden group border border-white/50 hover:border-blue-200/50"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #faf5ff 50%, #fef3c7 75%, #ffffff 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              {/* Decorative Background Shapes */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-pink-200/30 rounded-full transform -translate-x-6 translate-y-6 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700"></div>
              
              {/* Quote */}
              <div className="mb-8 relative z-10">
                <p className="text-gray-800 leading-relaxed text-base lg:text-lg font-medium italic">
                  {testimonial.quote}
                </p>
              </div>

              {/* Student LuInfo with Beautiful Layout */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-white font-bold text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-xl mb-1">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm font-medium">
                      {testimonial.school}
                    </p>
                  </div>
                </div>
                
                {/* Grade Badge with Beautiful Design */}
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-100 via-green-100 to-teal-100 text-emerald-800 px-6 py-3 rounded-2xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-emerald-200/50">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"></div>
                  <span className="font-bold">{testimonial.grade}</span>
                </div>
              </div>
              
              {/* Subtle Border Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-12 space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-gray-800 scale-125'
                  : 'bg-gray-400 hover:bg-gray-600 hover:scale-110'
              } ${
                isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
