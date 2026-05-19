'use client';

import { useState, useEffect } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LuSave as Save,
  LuRefreshCw as RefreshCw,
  LuCheck as CheckCircle,
  LuX as X,
} from 'react-icons/lu';
import {
  defaultAboutContent,
  defaultBlogContent,
  defaultCertificatesContent,
  defaultCourseLessonBannerContent,
  defaultCoursesByCategoryContent,
  defaultCoursesContent,
  defaultDownloadAppContent,
  defaultFAQContent,
  defaultFooterContent,
  defaultHeroContent,
  defaultPhotoGalleryContent,
  defaultPromoBannerContent,
  defaultSectionOrder,
  defaultServicesContent,
  defaultStatisticsContent,
  defaultWhyChooseUsContent,
  defaultContactPageContent,
  defaultPartnersContent,
  defaultWebsiteContent,
} from '@/lib/websiteContentDefaults';
import type { WebsiteContent } from './sections/types';
import { CMS_SIDEBAR_GROUPS, getCmsTabLabel, isMoreTab, MORE_TAB_IDS } from './cmsSidebarConfig';
import { CmsSectionsLayout } from './CmsSectionsLayout';
import { ContactPageSection } from './sections/ContactPageSection';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { FAQSection } from './sections/FAQSection';
import { PartnersSection } from './sections/PartnersSection';
import { BrandingSection } from './sections/BrandingSection';
import { MarqueeSection } from './sections/MarqueeSection';
import { ContactSocialSection } from './sections/ContactSocialSection';
import { NavigationSection } from './sections/NavigationSection';
import { FooterSection } from './sections/FooterSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { CoursesSection } from './sections/CoursesSection';
import { PromoBannersSection } from './sections/PromoBannersSection';
import { SectionOrderSection } from './sections/SectionOrderSection';
import { FutureSections, type FutureSubTab } from './sections/FutureSections';

function WebsiteContentPageContent() {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('hero');
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingNavItem, setEditingNavItem] = useState<{ section: string; index: number } | null>(null);
  const [uploadingAsset, setUploadingAsset] = useState<'logo' | 'favicon' | null>(null);
  
  // Reviews management state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [creatingReview, setCreatingReview] = useState(false);
  const [reviewCourses, setReviewCourses] = useState<Array<{ _id: string; title: string }>>([]);
  const [newReview, setNewReview] = useState({
    course: '',
    rating: 5,
    reviewType: 'text' as 'text' | 'video',
    title: '',
    comment: '',
    videoUrl: '',
    videoThumbnail: '',
    isPublic: true,
    isApproved: true,
    isDisplayed: false,
  });

  // Published courses list for "Featured courses" selector (courses tab)
  const [publishedCoursesList, setPublishedCoursesList] = useState<Array<{ _id: string; title: string }>>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  // Fetch published courses when courses tab is active (for featured course selector)
  useEffect(() => {
    if (activeTab !== 'courses') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/courses?limit=500&page=1&status=published', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const list = data?.data?.courses ?? data?.courses ?? [];
        if (!cancelled) setPublishedCoursesList(Array.isArray(list) ? list.map((c: any) => ({ _id: c._id, title: c.title || c._id })) : []);
      } catch {
        if (!cancelled) setPublishedCoursesList([]);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  // Ensure about content is initialized when switching to about tab
  useEffect(() => {
    if (activeTab === 'about' && content && (!content.about || !content.about.label || !content.about.title || !content.about.description)) {
      const updatedAbout = { 
        ...defaultAboutContent, 
        ...(content.about || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultAboutContent.label, ...(content.about?.label || {}) },
        title: { ...defaultAboutContent.title, ...(content.about?.title || {}) },
        titleColors: { ...defaultAboutContent.titleColors, ...(content.about?.titleColors || {}) },
        experience: { ...defaultAboutContent.experience, ...(content.about?.experience || {}) },
        images: { ...defaultAboutContent.images, ...(content.about?.images || {}) },
        button: { ...defaultAboutContent.button, ...(content.about?.button || {}) },
        features: content.about?.features && content.about.features.length > 0 
          ? content.about.features 
          : [...defaultAboutContent.features],
      };
      setContent({
        ...content,
        about: updatedAbout
      });
    }
    // Ensure whyChooseUs content is initialized when switching to whyChooseUs tab
    if (activeTab === 'whyChooseUs' && content && (!content.whyChooseUs || !content.whyChooseUs.label || !content.whyChooseUs.title || !content.whyChooseUs.description)) {
      const updatedWhyChooseUs = { 
        ...defaultWhyChooseUsContent, 
        ...(content.whyChooseUs || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultWhyChooseUsContent.label, ...(content.whyChooseUs?.label || {}) },
        title: { ...defaultWhyChooseUsContent.title, ...(content.whyChooseUs?.title || {}) },
        titleColors: { ...defaultWhyChooseUsContent.titleColors, ...(content.whyChooseUs?.titleColors || {}) },
        features: content.whyChooseUs?.features && content.whyChooseUs.features.length > 0 
          ? content.whyChooseUs.features 
          : [...defaultWhyChooseUsContent.features],
      };
      setContent({
        ...content,
        whyChooseUs: updatedWhyChooseUs
      });
    }
    // Ensure statistics content is initialized when switching to statistics tab
    if (activeTab === 'statistics' && content && (!content.statistics || !content.statistics.items || content.statistics.items.length === 0)) {
      const updatedStatistics = { 
        ...defaultStatisticsContent, 
        ...(content.statistics || {}),
      };
      setContent({
        ...content,
        statistics: updatedStatistics
      });
    }
    // Ensure statistics content is initialized when switching to statistics tab
    if (activeTab === 'statistics' && content && (!content.statistics || !content.statistics.items || content.statistics.items.length === 0)) {
      const updatedStatistics = { 
        ...defaultStatisticsContent, 
        ...(content.statistics || {}),
      };
      setContent({
        ...content,
        statistics: updatedStatistics
      });
    }
    // Ensure services content is initialized when switching to services tab
    if (
      activeTab === 'services' &&
      content &&
      (
        !content.services ||
        !content.services.services ||
        content.services.services.length === 0 ||
        !content.services.batchSection
      )
    ) {
      const defaultBatchSection = defaultServicesContent.batchSection || {
        onlineButtonLabel: 'অনলাইন ব্যাচ',
        offlineButtonLabel: 'অফলাইন ব্যাচ',
        defaultActiveTab: 'online' as const,
        onlineBackground: { from: '#063248', via: '#0B4B6A', to: '#063248' },
        offlineBackground: { from: '#1E293B', via: '#334155', to: '#1E293B' },
        onlineLevels: [],
        offlineLevels: [],
      };
      const updatedServices = { 
        ...defaultServicesContent, 
        ...(content.services || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultServicesContent.label, ...(content.services?.label || {}) },
        title: { ...defaultServicesContent.title, ...(content.services?.title || {}) },
        titleColors: { ...defaultServicesContent.titleColors, ...(content.services?.titleColors || {}) },
        gradientColors: content.services?.gradientColors || defaultServicesContent.gradientColors,
        batchSection: {
          ...defaultBatchSection,
          ...(content.services?.batchSection || {}),
          onlineBackground: {
            ...defaultBatchSection.onlineBackground,
            ...(content.services?.batchSection?.onlineBackground || {}),
          },
          offlineBackground: {
            ...defaultBatchSection.offlineBackground,
            ...(content.services?.batchSection?.offlineBackground || {}),
          },
          onlineLevels:
            content.services?.batchSection?.onlineLevels &&
            content.services.batchSection.onlineLevels.length > 0
              ? content.services.batchSection.onlineLevels
              : [...defaultBatchSection.onlineLevels],
          offlineLevels:
            content.services?.batchSection?.offlineLevels &&
            content.services.batchSection.offlineLevels.length > 0
              ? content.services.batchSection.offlineLevels
              : [...defaultBatchSection.offlineLevels],
        },
      };
      setContent({
        ...content,
        services: updatedServices
      });
    }
    // Ensure certificates content is initialized when switching to certificates tab
    // Keep an empty certificates array if admin intentionally deleted all items.
    if (activeTab === 'certificates' && content && !content.certificates) {
      setContent({
        ...content,
        certificates: { ...defaultCertificatesContent }
      });
    }
    // Ensure FAQ content is initialized when switching to FAQ tab
    if (activeTab === 'faq' && content && (!content.faq || !content.faq.faqs || content.faq.faqs.length === 0)) {
      const updatedFAQ = { 
        ...defaultFAQContent, 
        ...(content.faq || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultFAQContent.label, ...(content.faq?.label || {}) },
        title: { ...defaultFAQContent.title, ...(content.faq?.title || {}) },
        titleColors: { ...defaultFAQContent.titleColors, ...(content.faq?.titleColors || {}) },
        gradientColors: content.faq?.gradientColors || defaultFAQContent.gradientColors,
        faqs: content.faq?.faqs && content.faq.faqs.length > 0 
          ? content.faq.faqs 
          : [...defaultFAQContent.faqs],
      };
      setContent({
        ...content,
        faq: updatedFAQ
      });
    }
    // Ensure photoGallery content is initialized when switching to photoGallery tab
    if (activeTab === 'photoGallery' && content && (!content.photoGallery || !content.photoGallery.images || content.photoGallery.images.length === 0)) {
      const updatedPhotoGallery = { 
        ...defaultPhotoGalleryContent, 
        ...(content.photoGallery || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultPhotoGalleryContent.label, ...(content.photoGallery?.label || {}) },
        title: { ...defaultPhotoGalleryContent.title, ...(content.photoGallery?.title || {}) },
        titleColors: { ...defaultPhotoGalleryContent.titleColors, ...(content.photoGallery?.titleColors || {}) },
        gradientColors: content.photoGallery?.gradientColors || defaultPhotoGalleryContent.gradientColors,
        images: content.photoGallery?.images && content.photoGallery.images.length > 0 
          ? content.photoGallery.images 
          : [...defaultPhotoGalleryContent.images],
      };
      setContent({
        ...content,
        photoGallery: updatedPhotoGallery
      });
    }
    // Ensure blog content is initialized when switching to blog tab
    if (activeTab === 'blog' && content && (!content.blog || !content.blog.posts || content.blog.posts.length === 0)) {
      const updatedBlog = { 
        ...defaultBlogContent, 
        ...(content.blog || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultBlogContent.label, ...(content.blog?.label || {}) },
        title: { ...defaultBlogContent.title, ...(content.blog?.title || {}) },
        titleColors: { ...defaultBlogContent.titleColors, ...(content.blog?.titleColors || {}) },
        gradientColors: content.blog?.gradientColors || defaultBlogContent.gradientColors,
        posts: content.blog?.posts && content.blog.posts.length > 0 
          ? content.blog.posts 
          : [...defaultBlogContent.posts],
      };
      setContent({
        ...content,
        blog: updatedBlog
      });
    }
    // Ensure promotional banner is initialized when switching to promoBanner tab
    if (activeTab === 'promoBanner' && content && (!content.promotionalBanner || content.promotionalBanner.headline === undefined)) {
      setContent({
        ...content,
        promotionalBanner: { ...defaultPromoBannerContent, ...(content.promotionalBanner || {}) },
      });
    }
    // Ensure course lesson banner is initialized when switching to courseLessonBanner tab
    if (activeTab === 'courseLessonBanner' && content && (!content.courseLessonBanner || content.courseLessonBanner.title === undefined)) {
      setContent({
        ...content,
        courseLessonBanner: { ...defaultCourseLessonBannerContent, ...(content.courseLessonBanner || {}) },
      });
    }
    // Ensure courses content is initialized when switching to courses tab
    if (activeTab === 'courses' && content && (!content.courses || !content.courses.title || !content.courses.buttonText)) {
      const updatedCourses = { 
        ...defaultCoursesContent, 
        ...(content.courses || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultCoursesContent.label, ...(content.courses?.label || {}) },
        title: { ...defaultCoursesContent.title, ...(content.courses?.title || {}) },
        titleColors: { ...defaultCoursesContent.titleColors, ...(content.courses?.titleColors || {}) },
        gradientColors: { ...defaultCoursesContent.gradientColors, ...(content.courses?.gradientColors || {}) },
        featuredCourseIds: content.courses?.featuredCourseIds ?? defaultCoursesContent.featuredCourseIds,
      };
      setContent({
        ...content,
        courses: updatedCourses
      });
    }
    // Ensure coursesByCategory content is initialized when switching to coursesByCategory tab
    if (activeTab === 'coursesByCategory' && content && (!content.coursesByCategory || !content.coursesByCategory.title || !content.coursesByCategory.buttonText)) {
      const updatedCoursesByCategory = { 
        ...defaultCoursesByCategoryContent, 
        ...(content.coursesByCategory || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultCoursesByCategoryContent.label, ...(content.coursesByCategory?.label || {}) },
        title: { ...defaultCoursesByCategoryContent.title, ...(content.coursesByCategory?.title || {}) },
        titleColors: { ...defaultCoursesByCategoryContent.titleColors, ...(content.coursesByCategory?.titleColors || {}) },
        gradientColors: { ...defaultCoursesByCategoryContent.gradientColors, ...(content.coursesByCategory?.gradientColors || {}) },
      };
      setContent({
        ...content,
        coursesByCategory: updatedCoursesByCategory
      });
    }
    // Ensure downloadApp content is initialized when switching to downloadApp tab
    if (activeTab === 'downloadApp' && content && (!content.downloadApp || !content.downloadApp.title || !content.downloadApp.description)) {
      const updatedDownloadApp = { 
        ...defaultDownloadAppContent, 
        ...(content.downloadApp || {}),
        // Ensure nested objects are properly merged
        label: { ...defaultDownloadAppContent.label, ...(content.downloadApp?.label || {}) },
        title: { ...defaultDownloadAppContent.title, ...(content.downloadApp?.title || {}) },
        titleColors: { ...defaultDownloadAppContent.titleColors, ...(content.downloadApp?.titleColors || {}) },
        buttons: {
          googlePlay: { ...defaultDownloadAppContent.buttons.googlePlay, ...(content.downloadApp?.buttons?.googlePlay || {}) },
          appStore: { ...defaultDownloadAppContent.buttons.appStore, ...(content.downloadApp?.buttons?.appStore || {}) },
        },
      };
      setContent({
        ...content,
        downloadApp: updatedDownloadApp
      });
    }
    // Ensure footer content is initialized when switching to footer tab
    if (activeTab === 'footer' && content && (!content.footer || !content.footer.branding || !content.footer.companyLinks || content.footer.companyLinks.length === 0)) {
      const updatedFooter = { 
        ...defaultFooterContent, 
        ...(content.footer || {}),
        // Ensure nested objects are properly merged
        branding: { ...defaultFooterContent.branding, ...(content.footer?.branding || {}) },
        newsletter: { ...defaultFooterContent.newsletter, ...(content.footer?.newsletter || {}) },
        contact: { 
          address: { ...defaultFooterContent.contact.address, ...(content.footer?.contact?.address || {}) },
          phone: { ...defaultFooterContent.contact.phone, ...(content.footer?.contact?.phone || {}) },
          email: { ...defaultFooterContent.contact.email, ...(content.footer?.contact?.email || {}) },
        },
        backgroundGradient: { ...defaultFooterContent.backgroundGradient, ...(content.footer?.backgroundGradient || {}) },
        companyLinks: content.footer?.companyLinks && content.footer.companyLinks.length > 0 
          ? content.footer.companyLinks 
          : [...defaultFooterContent.companyLinks],
        quickLinks: content.footer?.quickLinks && content.footer.quickLinks.length > 0 
          ? content.footer.quickLinks 
          : [...defaultFooterContent.quickLinks],
      };
      setContent({
        ...content,
        footer: updatedFooter
      });
    }
    if (activeTab === 'contactPage' && content && !content.contactPage?.headline) {
      setContent({
        ...content,
        contactPage: { ...defaultContactPageContent, ...(content.contactPage || {}) },
      });
    }
  }, [activeTab]); // Only depend on activeTab to avoid infinite loops

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      // Admin portal: no cache, always fetch fresh data
      const response = await fetch('/api/admin/website-content', {
        cache: 'no-store', // Always fetch fresh data for admin
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      // Ensure hero content uses defaultHeroContent if missing
      const fetchedContent = data.data || {};
      // Merge with default hero content if hero is missing or incomplete
      if (!fetchedContent.hero || !fetchedContent.hero.subtitle) {
        fetchedContent.hero = { ...defaultHeroContent, ...(fetchedContent.hero || {}) };
      }
      // Ensure gradientColors exists if part2 or part3 is gradient
      if ((fetchedContent.hero?.titleColors?.part2 === 'gradient' || fetchedContent.hero?.titleColors?.part3 === 'gradient') && !fetchedContent.hero.gradientColors) {
        fetchedContent.hero.gradientColors = defaultHeroContent.gradientColors;
      }
      // Ensure about content uses defaultAboutContent if missing or incomplete
      if (!fetchedContent.about || !fetchedContent.about.label || !fetchedContent.about.title || !fetchedContent.about.description) {
        fetchedContent.about = { 
          ...defaultAboutContent, 
          ...(fetchedContent.about || {}),
          // Ensure nested objects are properly merged
          label: { ...defaultAboutContent.label, ...(fetchedContent.about?.label || {}) },
          title: { ...defaultAboutContent.title, ...(fetchedContent.about?.title || {}) },
          titleColors: { ...defaultAboutContent.titleColors, ...(fetchedContent.about?.titleColors || {}) },
          experience: { ...defaultAboutContent.experience, ...(fetchedContent.about?.experience || {}) },
          images: { ...defaultAboutContent.images, ...(fetchedContent.about?.images || {}) },
          button: { ...defaultAboutContent.button, ...(fetchedContent.about?.button || {}) },
        };
      }
      // Ensure features array exists and has items
      if (!fetchedContent.about.features || fetchedContent.about.features.length === 0) {
        fetchedContent.about.features = [...defaultAboutContent.features];
      }
      // Ensure courses content uses defaultCoursesContent if missing or incomplete
      if (!fetchedContent.courses || !fetchedContent.courses.title || !fetchedContent.courses.buttonText) {
        fetchedContent.courses = { 
          ...defaultCoursesContent, 
          ...(fetchedContent.courses || {}),
          // Ensure nested objects are properly merged
          label: { ...defaultCoursesContent.label, ...(fetchedContent.courses?.label || {}) },
          title: { ...defaultCoursesContent.title, ...(fetchedContent.courses?.title || {}) },
          titleColors: { ...defaultCoursesContent.titleColors, ...(fetchedContent.courses?.titleColors || {}) },
          gradientColors: { ...defaultCoursesContent.gradientColors, ...(fetchedContent.courses?.gradientColors || {}) },
        };
      }
      // Ensure contact has registrationNumber
      if (!fetchedContent.contact || !fetchedContent.contact.registrationNumber) {
        fetchedContent.contact = {
          registrationNumber: fetchedContent.contact?.registrationNumber || 'বাংলাদেশ সরকার অনুমোদিত রেজিঃ নং- ৩১১০৫'
        };
      }
      if (!fetchedContent.contactPage || !fetchedContent.contactPage.headline) {
        fetchedContent.contactPage = {
          ...defaultContactPageContent,
          ...(fetchedContent.contactPage || {}),
        };
      }
      // Ensure meta title and branding defaults exist
      if (!fetchedContent.metaTitle) {
        fetchedContent.metaTitle = 'CodeZyne - Online Learning Platform';
      }
      fetchedContent.branding = {
        logoText: 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦',
        logoTextColor1: '#7B2CBF',
        logoTextColor2: '#FF6B35',
        logoIconColor1: '#FF6B35',
        logoIconColor2: '#7B2CBF',
        logoUrl: '',
        faviconUrl: '',
        ...(fetchedContent.branding || {}),
      };
      // Ensure promotional banner has defaults
      if (!fetchedContent.promotionalBanner || fetchedContent.promotionalBanner.headline === undefined) {
        fetchedContent.promotionalBanner = { ...defaultPromoBannerContent, ...(fetchedContent.promotionalBanner || {}) };
      }
      // Ensure course lesson banner has defaults
      if (!fetchedContent.courseLessonBanner || fetchedContent.courseLessonBanner.title === undefined) {
        fetchedContent.courseLessonBanner = { ...defaultCourseLessonBannerContent, ...(fetchedContent.courseLessonBanner || {}) };
      }
      if (!fetchedContent.mobileMenu?.items?.length) {
        fetchedContent.mobileMenu = {
          items: [...defaultWebsiteContent.mobileMenu.items],
        };
      }
      if (!fetchedContent.partners?.items?.length) {
        const legacyMethods = (
          fetchedContent.footer as { paymentGateway?: { methods?: string[]; title?: string } }
        )?.paymentGateway?.methods;
        if (legacyMethods?.length) {
          fetchedContent.partners = {
            title:
              (fetchedContent.footer as { paymentGateway?: { title?: string } })
                ?.paymentGateway?.title || defaultPartnersContent.title,
            items: legacyMethods.map((name: string) => ({
              name,
              imageUrl: "",
              href: "",
            })),
          };
        } else {
          fetchedContent.partners = { ...defaultPartnersContent };
        }
      }
      setContent(fetchedContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setSaveStatus('error');
      // Initialize with default content on error
      setContent({ 
        metaTitle: 'CodeZyne - Online Learning Platform',
        branding: {
          logoText: 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦',
          logoTextColor1: '#7B2CBF',
          logoTextColor2: '#FF6B35',
          logoIconColor1: '#FF6B35',
          logoIconColor2: '#7B2CBF',
          logoUrl: '',
          faviconUrl: '',
        },
        hero: defaultHeroContent,
        about: defaultAboutContent,
        whyChooseUs: defaultWhyChooseUsContent,
        statistics: defaultStatisticsContent,
        services: defaultServicesContent,
        certificates: defaultCertificatesContent,
        photoGallery: defaultPhotoGalleryContent,
        blog: defaultBlogContent,
        downloadApp: defaultDownloadAppContent,
        footer: defaultFooterContent,
        courses: defaultCoursesContent,
        coursesByCategory: defaultCoursesByCategoryContent,
        promotionalBanner: defaultPromoBannerContent,
        courseLessonBanner: defaultCourseLessonBannerContent,
        sectionOrder: defaultSectionOrder,
        contact: {
          registrationNumber: 'বাংলাদেশ সরকার অনুমোদিত রেজিঃ নং- ৩১১০৫'
        },
        contactPage: defaultContactPageContent,
      } as WebsiteContent);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch('/api/course-reviews?limit=1000', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        const reviewsData = data.data?.reviews || data.reviews || [];
        // Normalize isDisplayed field - treat undefined as false for UI consistency
        const normalizedReviews = reviewsData.map((review: any) => ({
          ...review,
          isDisplayed: review.isDisplayed !== undefined ? review.isDisplayed : false
        }));
        setReviews(normalizedReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchReviewFormOptions = async () => {
    try {
      const coursesResponse = await fetch('/api/courses?limit=500&page=1', { cache: 'no-store' });

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        const list = coursesData?.data?.courses || coursesData?.courses || [];
        setReviewCourses(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error('Error fetching review form options:', error);
    }
  };

  const resetNewReviewForm = () => {
    setNewReview({
      course: '',
      rating: 5,
      reviewType: 'text',
      title: '',
      comment: '',
      videoUrl: '',
      videoThumbnail: '',
      isPublic: true,
      isApproved: true,
      isDisplayed: false,
    });
  };

  const handleCreateReview = async () => {
    if (!newReview.course) {
      alert('Please select a course');
      return;
    }

    if (newReview.reviewType === 'text' && !newReview.comment.trim()) {
      alert('Comment is required for text reviews');
      return;
    }

    if (newReview.reviewType === 'video' && !newReview.videoUrl.trim()) {
      alert('Video URL is required for video reviews');
      return;
    }

    try {
      setCreatingReview(true);
      const response = await fetch('/api/admin/course-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReview,
          title: newReview.title.trim() || undefined,
          comment: newReview.comment.trim() || undefined,
          videoUrl: newReview.videoUrl.trim() || undefined,
          videoThumbnail: newReview.videoThumbnail.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create review');
        return;
      }

      setShowAddReviewModal(false);
      resetNewReviewForm();
      await fetchReviews();
      alert('Review added successfully');
    } catch (error) {
      console.error('Error creating review:', error);
      alert('Error creating review');
    } finally {
      setCreatingReview(false);
    }
  };

  // Toggle review display status
  const toggleReviewDisplay = async (reviewId: string, currentStatus: boolean) => {
    try {
      // If currentStatus is undefined/null, treat it as false
      const currentValue = currentStatus === true;
      const newValue = !currentValue;

      // If enabling display, set displayOrder to the end of displayed reviews
      let displayOrder = 0;
      if (newValue) {
        const currentDisplayedCount = reviews.filter(r => r.isDisplayed === true).length;
        displayOrder = currentDisplayedCount + 1;
      }

      const response = await fetch(`/api/admin/course-reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDisplayed: newValue,
          displayOrder: newValue ? displayOrder : 0,
        }),
      });

      if (response.ok) {
        // Update local state - ensure isDisplayed is always a boolean
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? { ...review, isDisplayed: newValue, displayOrder: newValue ? displayOrder : 0 }
              : review
          )
        );
      } else {
        const data = await response.json();
        console.error('Failed to update review:', data.error);
        alert('Failed to update review display status');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Error updating review display status');
    }
  };

  // Update review display order
  const updateReviewOrder = async (reorderedDisplayedReviews: any[]) => {
    try {
      // Update displayOrder for all displayed reviews
      const updatePromises = reorderedDisplayedReviews
        .filter(review => review.isDisplayed === true)
        .map((review, index) => 
          fetch(`/api/admin/course-reviews/${review._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              displayOrder: index + 1,
            }),
          })
        );

      const responses = await Promise.all(updatePromises);
      if (responses.some((response) => !response.ok)) {
        alert('Failed to update review order');
        return;
      }

      const displayOrderMap = new Map(
        reorderedDisplayedReviews
          .filter((review) => review.isDisplayed === true)
          .map((review, index) => [review._id, index + 1])
      );

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.isDisplayed === true && displayOrderMap.has(review._id)
            ? { ...review, displayOrder: displayOrderMap.get(review._id) }
            : review
        )
      );
    } catch (error) {
      console.error('Error updating review order:', error);
      alert('Error updating review order');
    }
  };

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
      fetchReviewFormOptions();
    }
  }, [activeTab]);


  function getReviewStudentLabel(review: any) {
    const customName = review?.displayStudentName?.trim();
    if (customName) return customName;
    const firstName = review?.student?.firstName || '';
    const lastName = review?.student?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Unknown';
  }

  // Filter reviews based on search
  const filteredReviews = reviews.filter((review) => {
    if (!reviewSearch) return true;
    const searchLower = reviewSearch.toLowerCase();
    const studentName = getReviewStudentLabel(review).toLowerCase();
    const courseTitle = typeof review.course === 'object' ? review.course?.title || '' : '';
    const reviewTitle = review.title || '';
    const reviewComment = review.comment || '';
    
    return (
      studentName.includes(searchLower) ||
      courseTitle.toLowerCase().includes(searchLower) ||
      reviewTitle.toLowerCase().includes(searchLower) ||
      reviewComment.toLowerCase().includes(searchLower)
    );
  });

  // Separate displayed and hidden reviews for ordering
  const displayedReviews = filteredReviews
    .filter(review => review.isDisplayed === true)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const hiddenReviews = filteredReviews.filter(review => review.isDisplayed !== true);

  const handleSave = async () => {
    if (!content) return;
    
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/admin/website-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: content }),
      });

      if (!response.ok) throw new Error('Failed to save content');
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all content to default?')) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/website-content', {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to reset content');
      
      const data = await response.json();
      setContent(data.data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error resetting content:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (path: string[], value: any) => {
    if (!content) return;
    
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setContent(newContent);
  };

  const addFeaturedCourse = (courseId: string) => {
    if (!content || !courseId) return;
    const currentIds = content.courses?.featuredCourseIds ?? [];
    if (currentIds.includes(courseId)) return;
    if (currentIds.length >= 8) {
      alert('You can select up to 8 featured courses.');
      return;
    }
    updateContent(['courses', 'featuredCourseIds'], [...currentIds, courseId]);
  };

  const removeFeaturedCourse = (courseId: string) => {
    if (!content) return;
    const currentIds = content.courses?.featuredCourseIds ?? [];
    updateContent(
      ['courses', 'featuredCourseIds'],
      currentIds.filter((id) => id !== courseId)
    );
  };

  const moveFeaturedCourse = (courseId: string, direction: 'up' | 'down') => {
    if (!content) return;
    const currentIds = [...(content.courses?.featuredCourseIds ?? [])];
    const index = currentIds.indexOf(courseId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentIds.length) return;

    [currentIds[index], currentIds[targetIndex]] = [currentIds[targetIndex], currentIds[index]];
    updateContent(['courses', 'featuredCourseIds'], currentIds);
  };

  const handleBrandingUpload = async (event: any, assetType: 'logo' | 'favicon') => {
    const file = event.target.files?.[0];
    if (!file || !content) return;

    try {
      setUploadingAsset(assetType);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', assetType);

      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data?.imageUrl) {
        throw new Error(data?.error || `Failed to upload ${assetType}`);
      }

      updateContent(['branding', assetType === 'logo' ? 'logoUrl' : 'faviconUrl'], data.imageUrl);
    } catch (error) {
      console.error(`Error uploading ${assetType}:`, error);
      alert(error instanceof Error ? error.message : `Failed to upload ${assetType}`);
    } finally {
      setUploadingAsset(null);
      event.target.value = '';
    }
  };

  const addMarqueeMessage = () => {
    if (!content) return;
    const newMessages = [...content.marquee.messages, ''];
    updateContent(['marquee', 'messages'], newMessages);
    setEditingMessageIndex(newMessages.length - 1);
  };

  const removeMarqueeMessage = (index: number) => {
    if (!content) return;
    const newMessages = content.marquee.messages.filter((_, i) => i !== index);
    updateContent(['marquee', 'messages'], newMessages);
  };

  const addNavItem = (section: string) => {
    if (!content) return;
    const navSection = content.navigation[section as keyof typeof content.navigation];
    if ('items' in navSection && Array.isArray(navSection.items)) {
      const newItems = [...navSection.items, { label: '', href: '' }];
      updateContent(['navigation', section, 'items'], newItems);
      setEditingNavItem({ section, index: newItems.length - 1 });
    }
  };

  const removeNavItem = (section: string, index: number) => {
    if (!content) return;
    const navSection = content.navigation[section as keyof typeof content.navigation];
    if ('items' in navSection && Array.isArray(navSection.items)) {
      const newItems = navSection.items.filter((_, i) => i !== index);
      updateContent(['navigation', section, 'items'], newItems);
    }
  };
  const renderActivePanel = () => {
    if (!content) return null;

    if (activeTab === 'hero') {
      return <HeroSection content={content} updateContent={updateContent} />;
    }
    if (activeTab === 'about') {
      return <AboutSection content={content} updateContent={updateContent} />;
    }
    if (activeTab === 'contactPage') {
      return <ContactPageSection content={content} updateContent={updateContent} />;
    }
    if (activeTab === 'whyChooseUs' || activeTab === 'statistics') {
      return (
        <FutureSections
          content={content}
          updateContent={updateContent}
          activeSubTab={activeTab as FutureSubTab}
          onSubTabChange={(tab) => setActiveTab(tab)}
          hideSubNav
        />
      );
    }
    if (activeTab === 'faq') {
      return <FAQSection content={content} updateContent={updateContent} />;
    }
    if (activeTab === 'promoBanner' || activeTab === 'courseLessonBanner') {
      return (
        <PromoBannersSection
          content={content}
          updateContent={updateContent}
          activeSubTab={activeTab as 'promoBanner' | 'courseLessonBanner'}
          onSubTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (activeTab === 'sectionOrder') {
      return <SectionOrderSection content={content} updateContent={updateContent} sensors={sensors} />;
    }
    if (activeTab === 'branding') {
      return (
        <BrandingSection
          content={content}
          updateContent={updateContent}
          uploadingAsset={uploadingAsset}
          handleBrandingUpload={handleBrandingUpload}
        />
      );
    }
    if (activeTab === 'contact' || activeTab === 'social') {
      return (
        <ContactSocialSection
          content={content}
          updateContent={updateContent}
          activeSubTab={activeTab as 'contact' | 'social'}
          onSubTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (activeTab === 'marquee') {
      return (
        <MarqueeSection
          content={content}
          updateContent={updateContent}
          editingMessageIndex={editingMessageIndex}
          setEditingMessageIndex={setEditingMessageIndex}
          addMarqueeMessage={addMarqueeMessage}
          removeMarqueeMessage={removeMarqueeMessage}
        />
      );
    }
    if (activeTab === 'courses' || activeTab === 'coursesByCategory') {
      return (
        <CoursesSection
          content={content}
          updateContent={updateContent}
          activeSubTab={activeTab as 'courses' | 'coursesByCategory'}
          onSubTabChange={(tab) => setActiveTab(tab)}
          publishedCoursesList={publishedCoursesList}
          addFeaturedCourse={addFeaturedCourse}
          removeFeaturedCourse={removeFeaturedCourse}
          moveFeaturedCourse={moveFeaturedCourse}
        />
      );
    }
    if (activeTab === 'reviews') {
      return (
        <ReviewsSection
          reviews={reviews}
          filteredReviews={filteredReviews}
          reviewsLoading={reviewsLoading}
          reviewSearch={reviewSearch}
          setReviewSearch={setReviewSearch}
          displayedReviews={displayedReviews}
          hiddenReviews={hiddenReviews}
          sensors={sensors}
          toggleReviewDisplay={toggleReviewDisplay}
          updateReviewOrder={updateReviewOrder}
          setShowAddReviewModal={setShowAddReviewModal}
          showAddReviewModal={showAddReviewModal}
          showReviewModal={showReviewModal}
          setShowReviewModal={setShowReviewModal}
          selectedReview={selectedReview}
          setSelectedReview={setSelectedReview}
          creatingReview={creatingReview}
          handleCreateReview={handleCreateReview}
          newReview={newReview}
          setNewReview={setNewReview}
          reviewCourses={reviewCourses}
          resetNewReviewForm={resetNewReviewForm}
        />
      );
    }
    if (activeTab === 'navigation' || activeTab === 'buttons' || activeTab === 'mobile') {
      const navSubTab =
        activeTab === 'buttons' ? 'buttons' : 'navigation';
      return (
        <NavigationSection
          content={content}
          updateContent={updateContent}
          activeSubTab={navSubTab}
          onSubTabChange={(tab) => setActiveTab(tab)}
        />
      );
    }
    if (activeTab === 'partners') {
      return <PartnersSection content={content} updateContent={updateContent} />;
    }
    if (activeTab === 'footer') {
      return <FooterSection content={content} updateContent={updateContent} />;
    }
    if (isMoreTab(activeTab)) {
      return (
        <FutureSections
          content={content}
          updateContent={updateContent}
          activeSubTab={activeTab as FutureSubTab}
          onSubTabChange={(tab) => setActiveTab(tab)}
          subTabs={MORE_TAB_IDS}
        />
      );
    }
    return null;
  };

  
  const tabLabel = getCmsTabLabel(activeTab);

  if (isLoading) {
    return (
      <AdminRoleShell>
        <main className="relative z-10 p-2 sm:p-4">
          <WelcomeSection 
            title="Website Content Management"
            description="Manage header content, navigation, branding, and more"
          />
          <PageSection className="mb-2 sm:mb-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7B2CBF] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading website content...</p>
              </div>
            </div>
          </PageSection>
        </main>
      </AdminRoleShell>
    );
  }

  if (!content) {
    return (
      <AdminRoleShell>
        <main className="relative z-10 p-2 sm:p-4">
          <WelcomeSection 
            title="Website Content Management"
            description="Manage header content, navigation, branding, and more"
          />
          <PageSection className="mb-2 sm:mb-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Failed to load content</p>
                <p className="text-gray-500 text-sm mt-2">Please try refreshing the page</p>
              </div>
            </div>
          </PageSection>
        </main>
      </AdminRoleShell>
    );
  }

  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Website Content Management"
          description="Manage header content, navigation, branding, and more"
        />
        {/* Save/Reset Actions */}
        <PageSection 
          title="Content Management"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                className="flex items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Reset to Default
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 text-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          }
        >
          <div className="flex items-center gap-4">
            {saveStatus === 'success' && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Saved successfully
              </Badge>
            )}
            {saveStatus === 'error' && (
              <Badge className="bg-red-500 text-white">
                <X className="w-4 h-4 mr-1" />
                Error saving
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Update website header content, navigation menus, branding, and contact information.
          </div>
        </PageSection>
        <CmsSectionsLayout
          groups={CMS_SIDEBAR_GROUPS}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        >
          <PageSection
            title={tabLabel}
            description={`Manage ${tabLabel.toLowerCase()} settings`}
            className="mb-0"
          >
            <div className="space-y-6">{renderActivePanel()}</div>
          </PageSection>
        </CmsSectionsLayout>

      </main>
    </AdminRoleShell>
  );
}

export default function WebsiteContentPage() {
  return (
    <AdminPageWrapper>
      <WebsiteContentPageContent />
    </AdminPageWrapper>
  );
}
