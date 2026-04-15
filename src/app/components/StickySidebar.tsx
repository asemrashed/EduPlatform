"use client";
import { useHasScrolled } from '@/hooks/useHasScrolled';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useState, useRef } from 'react'
import { LuCheck as Check } from 'react-icons/lu';

interface StickySidebarProps {
  courseData: any;
  onAddToCart: () => void;
  onStartCourse?: () => void;
  onEnrollment?: () => void;
  isInCart: boolean;
  isEnrolled?: boolean;
  isLoadingEnrollment?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
}

const StickySidebar = ({ courseData, onAddToCart, onStartCourse, onEnrollment, isInCart, isEnrolled = false, isLoadingEnrollment = false, onVisibilityChange }: StickySidebarProps) => {
    const isMobile = useIsMobile();
    const isScrolledForStickySidebar = useHasScrolled({
        threshold: 700,
        enabled: !isMobile, // Disable on mobile devices
      });
    
    const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({});
    const [isRelatedSectionVisible, setIsRelatedSectionVisible] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Check if Related Courses Section is visible in viewport
    useEffect(() => {
        const checkRelatedSectionVisibility = () => {
            const relatedSection = document.getElementById('related-courses-section');
            if (!relatedSection) {
                setIsRelatedSectionVisible(false);
                return;
            }

            const rect = relatedSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Check if section is visible in viewport (intersecting with viewport)
            // Section is considered visible when its top is above viewport bottom and bottom is below viewport top
            const isVisible = rect.top < windowHeight && rect.bottom > 0;
            setIsRelatedSectionVisible(isVisible);
        };

        checkRelatedSectionVisibility();
        window.addEventListener('scroll', checkRelatedSectionVisibility, { passive: true });
        window.addEventListener('resize', checkRelatedSectionVisibility, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', checkRelatedSectionVisibility);
            window.removeEventListener('resize', checkRelatedSectionVisibility);
        };
    }, []);

    useEffect(() => {
        const calculatePosition = () => {
            // Don't show on mobile/small devices
            if (isMobile || typeof window === 'undefined') {
                setIsVisible(false);
                onVisibilityChange?.(false);
                setSidebarStyle({});
                return;
            }

            // Determine if sidebar should be visible (only on large screens)
            const shouldShow = isScrolledForStickySidebar &&
                              !isRelatedSectionVisible &&
                              window.innerWidth >= 1024;

            setIsVisible(shouldShow);
            onVisibilityChange?.(shouldShow);

            if (!shouldShow) {
                setSidebarStyle({});
                return;
            }
            
            const viewportWidth = window.innerWidth;
            
            // Large screens: align with the sidebar in main content area
            // Main container: max-w-7xl (1280px) centered with lg:px-8 (32px padding)
            const maxContainerWidth = 1280;
            const padding = 32; // lg:px-8
            const gap = 32; // gap-8
            
            // Calculate actual container width
            const availableWidth = viewportWidth - (padding * 2);
            const containerWidth = Math.min(availableWidth, maxContainerWidth);
            
            // Sidebar is 1/3 of container width, max 400px
            const sidebarWidth = Math.min(containerWidth / 3, 400);
            
            // Calculate where sidebar should be positioned
            // Container is centered: (viewportWidth - containerWidth) / 2 or padding, whichever is larger
            const containerLeft = Math.max(padding, (viewportWidth - containerWidth) / 2);
            // Sidebar starts after left column (2/3) + gap
            const sidebarLeft = containerLeft + (containerWidth * 2 / 3) + gap;
            // Right position = viewport width - sidebar left - sidebar width
            const rightPosition = viewportWidth - sidebarLeft - sidebarWidth;
            
            setSidebarStyle({
                position: 'fixed',
                top: '80px',
                right: `${Math.max(padding, rightPosition)}px`,
                width: `${sidebarWidth}px`,
                maxWidth: '400px',
                zIndex: 9999,
            });
        };

        calculatePosition();
        const resizeHandler = () => calculatePosition();
        window.addEventListener('resize', resizeHandler);
        return () => window.removeEventListener('resize', resizeHandler);
    }, [isScrolledForStickySidebar, isRelatedSectionVisible, isMobile]);

  return (
    <>
       {/* Sticky sidebar when scrolled for sticky sidebar */}
       <div
              ref={sidebarRef}
              className={`course-single-sidebar rounded-[25px] bg-white/95 backdrop-blur-md transition-all duration-500 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}
              style={{
                padding: "30px",
                boxShadow: "0px 30px 50px 0px rgba(1, 11, 60, 0.1)",
                ...sidebarStyle,
              }}
            >
              {/* Pricing */}
              <div className="mb-6">
                <div className="mb-2 flex items-baseline gap-2">
                  <span
                    className="text-4xl font-bold text-[#FF6B35]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    ${courseData.price}
                  </span>
                  {courseData.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ${courseData.originalPrice}
                      </span>
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-600">
                        {courseData.discount}% Off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Enrollment Button */}
              <button
                onClick={onEnrollment}
                disabled={isEnrolled || isLoadingEnrollment || !onEnrollment}
                className={`mb-3 w-full rounded-lg px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg ${
                  isEnrolled || isLoadingEnrollment || !onEnrollment
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: isEnrolled
                    ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoadingEnrollment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{courseData?.price > 0 ? 'পেমেন্ট প্রক্রিয়াকরণ...' : 'নিবন্ধন করা হচ্ছে...'}</span>
                    </>
                  ) : isEnrolled ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Already Enrolled</span>
                    </>
                  ) : (
                    <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                      <span>{courseData?.price > 0 ? 'এখনই নিবন্ধন করুন' : 'বিনামূল্যে নিবন্ধন করুন'}</span>
                    </>
                  )}
                </div>
              </button>

              {isEnrolled ? (
                <button
                  type="button"
                  onClick={onStartCourse}
                  className="mb-6 w-full cursor-pointer rounded-lg border-2 border-[#10B981] bg-white px-6 py-3.5 font-semibold text-[#10B981] transition-all hover:bg-[#10B981] hover:text-white"
                  style={{
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 5V19L19 12L8 5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>কোর্স শুরু করুন</span>
                  </div>
                </button>
              ) : (
                /* Add to Cart Button - shows "Added" state when course is already in cart */
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart();
                  }}
                  disabled={isInCart}
                  className={`mb-6 w-full rounded-lg border-2 px-6 py-3.5 font-semibold transition-all ${
                    isInCart
                      ? 'cursor-default border-[#10B981] bg-[#10B981] text-white'
                      : 'border-[#A855F7] bg-white text-[#A855F7] hover:bg-[#A855F7] hover:text-white'
                  }`}
                  style={{
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isInCart ? (
                      <>
                        <Check className="w-5 h-5 shrink-0" />
                        <span>কার্টে যোগ করা হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>কার্টে যোগ করুন</span>
                      </>
                    )}
                  </div>
                </button>
              )}

              <div className="mt-4 rounded-lg border border-[#A855F7]/20 bg-[#A855F7]/5 p-3 text-center">
                <p
                  className="text-xs text-gray-600"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  এখনই যোগাযোগ করুন
                </p>
                <p className="text-sm font-semibold text-[#A855F7]">+৮৮ ০১২৩ ৬৫৪ ৭৮৯৮</p>
              </div>
            </div>
    </>
  )
}

export default StickySidebar
