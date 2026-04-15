'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/lib/hooks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import CustomEditor from '@/components/custom-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VideoWatermark from '@/components/VideoWatermark';
import { 
  LuSave as Save, 
  LuRefreshCw as RefreshCw, 
  LuCheck as CheckCircle, 
  LuX as X,
  LuPlus as Plus,
  LuTrash2 as Trash,
  LuGlobe as Globe,
  LuPhone as Phone,
  LuMail as Mail,
  LuPalette as Palette,
  LuNavigation as Navigation,
  LuMessageSquare as MessageSquare,
  LuLink as LinkIcon,
  LuSettings as Settings,
  LuSparkles as Sparkles,
  LuInfo as Info,
  LuStar as Star,
  LuChartBar as BarChart,
  LuBriefcase as Briefcase,
  LuAward as Award,
  LuImage as ImageIcon,
  LuFileText as FileText,
  LuDownload as DownloadIcon,
  LuLayoutList as LayoutIcon,
  LuArrowUp,
  LuArrowDown,
  LuGripVertical,
  LuSearch as Search,
  LuLoader as Loader2,
  LuPlay as Play,
  LuEye as Eye,
  LuEyeOff as EyeOff
} from 'react-icons/lu';
import { defaultHeroContent } from '@/constants/heroContent';
import { defaultAboutContent } from '@/constants/aboutContent';
import { defaultWhyChooseUsContent } from '@/constants/whyChooseUsContent';
import { defaultStatisticsContent } from '@/constants/statisticsContent';
import { defaultServicesContent } from '@/constants/servicesContent';
import { defaultCertificatesContent } from '@/constants/certificatesContent';
import { defaultPhotoGalleryContent } from '@/constants/photoGalleryContent';
import { defaultBlogContent } from '@/constants/blogContent';
import { defaultDownloadAppContent } from '@/constants/downloadAppContent';
import { defaultFooterContent } from '@/constants/footerContent';
import { defaultSectionOrder, SectionConfig } from '@/constants/sectionOrder';
import { defaultCoursesContent } from '@/constants/coursesContent';
import { defaultCoursesByCategoryContent } from '@/constants/coursesByCategoryContent';
import { defaultFAQContent } from '@/constants/faqContent';
import { defaultPromoBannerContent } from '@/constants/promoBannerContent';
import { defaultCourseLessonBannerContent } from '@/constants/courseLessonBannerContent';

interface WebsiteContent {
  metaTitle?: string;
  marquee: {
    enabled: boolean;
    messages: string[];
    gradientFrom: string;
    gradientTo: string;
  };
  contact: {
    registrationNumber: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram?: string;
    youtube?: string;
  };
  branding: {
    logoText: string;
    logoTextColor1: string;
    logoTextColor2: string;
    logoIconColor1: string;
    logoIconColor2: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  navigation: {
    home: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    category: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    pages: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    courses: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    account: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    contact: {
      label: string;
      href: string;
    };
  };
  buttons: {
    liveCourse: {
      enabled: boolean;
      text: string;
      href?: string;
    };
    login: {
      text: string;
      href: string;
    };
  };
  mobileMenu: {
    items: Array<{ label: string; href: string }>;
  };
  hero: {
    subtitle: string;
    title: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    gradientColors?: {
      from: string;
      via?: string;
      to: string;
    };
    description: string;
    buttons: {
      primary: {
        text: string;
        href: string;
      };
      secondary: {
        text: string;
        href: string;
      };
    };
    carousel: {
      enabled: boolean;
      autoPlay: boolean;
      autoPlayInterval: number;
      items: Array<{
        id: number;
        image: string;
        title: string;
        category: string;
      }>;
    };
    stats: {
      students: {
        enabled: boolean;
        count: string;
        avatars: string[];
      };
      courses: {
        enabled: boolean;
        count: string;
      };
    };
  };
  about?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    description: string;
    features: Array<{
      title: string;
      description: string;
    }>;
    button: {
      text: string;
      href?: string;
    };
    experience: {
      number: string;
      label: string;
      gradientFrom: string;
      gradientTo: string;
    };
    images: {
      main: string;
      secondary: string;
    };
  };
  whyChooseUs?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
    };
    description: string;
    image: string;
    features: Array<{
      id: number;
      title: string;
      titleBn: string;
      description: string;
      descriptionBn: string;
      iconType: 'money' | 'instructor' | 'flexible' | 'community';
    }>;
  };
  statistics?: {
    items: Array<{
      id: number;
      number: string;
      suffix: string;
      label: string;
      labelBengali: string;
      iconType: 'students' | 'courses' | 'tutors' | 'awards';
    }>;
  };
  services?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
    };
    titleColors: {
      part1: string;
      part2: string;
    };
    gradientColors?: {
      from: string;
      to: string;
    };
    services: Array<{
      id: number;
      title: string;
      titleBengali: string;
      description: string;
      iconType: 'online-courses' | 'live-classes' | 'certification' | 'expert-support' | 'career-guidance' | 'lifetime-access';
    }>;
    batchSection?: {
      onlineButtonLabel: string;
      offlineButtonLabel: string;
      defaultActiveTab: 'online' | 'offline';
      onlineBackground: {
        from: string;
        via: string;
        to: string;
      };
      offlineBackground: {
        from: string;
        via: string;
        to: string;
      };
      onlineLevels: Array<{
        id: string;
        label: string;
        subtitle: string;
        color: string;
      }>;
      offlineLevels: Array<{
        id: string;
        label: string;
        subtitle: string;
        color: string;
      }>;
    };
  };
  certificates?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
    };
    titleColors: {
      part1: string;
      part2: string;
    };
    gradientColors?: {
      from: string;
      via?: string;
      to: string;
    };
    certificates: Array<{
      id: number;
      titleBengali: string;
      titleEnglish: string;
      imageUrl: string;
      description?: string;
    }>;
    about: {
      title: string;
      description: string[];
      imageUrl: string;
      name: string;
      affiliation: string;
    };
  };
  photoGallery?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
    };
    titleColors: {
      part1: string;
      part2: string;
    };
    gradientColors?: {
      from: string;
      via?: string;
      to: string;
    };
    images: Array<{
      id: number;
      image: string;
      alt: string;
    }>;
  };
  blog?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
    };
    gradientColors?: {
      from: string;
      via?: string;
      to: string;
    };
    buttonText: string;
    posts: Array<{
      id: number;
      image: string;
      date: string;
      author: string;
      authorBengali: string;
      comments: string;
      commentsBengali: string;
      title: string;
      titleBengali: string;
      description: string;
      descriptionBengali: string;
    }>;
  };
  courses?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
    };
    titleColors: {
      part1: string;
      part2: string;
    };
    gradientColors: {
      from: string;
      via?: string;
      to: string;
    };
    buttonText: string;
    buttonHref: string;
    buttonGradientFrom: string;
    buttonGradientTo: string;
    featuredCourseIds?: string[];
  };
  coursesByCategory?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
      part3: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
    };
    gradientColors: {
      from: string;
      to: string;
    };
    buttonText: string;
    buttonHref: string;
    buttonGradientFrom: string;
    buttonGradientTo: string;
  };
  sectionOrder?: SectionConfig[];
  faq?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
    };
    titleColors: {
      part1: string;
      part2: string;
    };
    gradientColors?: {
      from: string;
      via?: string;
      to: string;
    };
    faqs: Array<{
      id: number;
      question: string;
      answer: string;
      order: number;
    }>;
  };
  promotionalBanner?: {
    enabled: boolean;
    imageUrl: string;
    link: string;
    headline: string;
    subtext: string;
    ctaLabel: string;
  };
  courseLessonBanner?: {
    enabled: boolean;
    title: string;
    imageUrl: string;
  };
  downloadApp?: {
    label: {
      text: string;
      backgroundColor: string;
    };
    title: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
      part6: string;
      part7: string;
    };
    titleColors: {
      part1: string;
      part2: string;
      part3: string;
      part4: string;
      part5: string;
      part6: string;
      part7: string;
    };
    description: string;
    buttons: {
      googlePlay: {
        text: string;
        href: string;
        gradientFrom: string;
        gradientTo: string;
      };
      appStore: {
        text: string;
        href: string;
        gradientFrom: string;
        gradientVia?: string;
        gradientTo: string;
      };
    };
    backgroundImage: string;
  };
  footer?: {
    branding: {
      logoText: string;
      logoIcon: string;
      logoIconColor: string;
      logoTextColor: string;
      description: string;
    };
    newsletter: {
      title: string;
      emailPlaceholder: string;
      buttonText: string;
      buttonGradientFrom: string;
      buttonGradientTo: string;
    };
    companyLinks: Array<{
      label: string;
      href: string;
    }>;
    quickLinks: Array<{
      label: string;
      href: string;
    }>;
    contact: {
      address: {
        label: string;
        value: string;
      };
      phone: {
        label: string;
        value: string;
      };
      email: {
        label: string;
        value: string;
      };
    };
    paymentGateway: {
      title: string;
      methods: string[];
    };
    copyright: string;
    socialMedia: Array<{
      name: string;
      icon: string;
      color: string;
      href: string;
    }>;
    backgroundGradient: {
      from: string;
      to: string;
    };
  };
}

// Draggable Section Item Component
function DraggableSectionItem({ section, onToggle }: { section: SectionConfig; onToggle: (enabled: boolean) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-[#7B2CBF] hover:shadow-md ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <LuGripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={section.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-[#7B2CBF] focus:ring-[#7B2CBF]"
          />
          <span className="font-semibold text-gray-900">{section.label}</span>
          <Badge variant="outline" className="text-xs">
            Order: {section.order}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function getReviewStudentLabel(review: any) {
  const customName = review?.displayStudentName?.trim();
  if (customName) return customName;
  const firstName = review?.student?.firstName || '';
  const lastName = review?.student?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Unknown';
}

// Sortable Review Item Component
function SortableReviewItem({ 
  review, 
  onToggleDisplay, 
  onView 
}: { 
  review: any; 
  onToggleDisplay: (reviewId: string, currentStatus: boolean) => void;
  onView: (review: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: review._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border-2 p-4 transition-all ${
        (review.isDisplayed === true)
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 pt-1"
        >
          <LuGripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {getReviewStudentLabel(review)}
            </span>
            {review.isApproved && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Approved
              </Badge>
            )}
            {review.isPublic && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Public
              </Badge>
            )}
            {review.reviewType === 'video' && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                <Play className="w-3 h-3 mr-1" />
                Video
              </Badge>
            )}
            {(review.isDisplayed === true) && (
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                Order: {review.displayOrder || 0}
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Course: {typeof review.course === 'object' ? review.course?.title || 'Unknown' : 'Unknown'}
          </div>
          {review.title && (
            <h4 className="text-sm font-semibold text-gray-800 mb-1">{review.title}</h4>
          )}
          {review.comment && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{review.comment}</p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(review)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <div className="flex flex-col items-center gap-2">
            <Checkbox
              checked={review.isDisplayed || false}
              onCheckedChange={() => onToggleDisplay(review._id, review.isDisplayed || false)}
              className="h-5 w-5"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {(review.isDisplayed === true) ? 'Displayed' : 'Hidden'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebsiteContentPageContent() {
  const { user } = useAppSelector((state) => state.auth);
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
        socialMedia: content.footer?.socialMedia && content.footer.socialMedia.length > 0 
          ? content.footer.socialMedia 
          : [...defaultFooterContent.socialMedia],
        paymentGateway: {
          ...defaultFooterContent.paymentGateway,
          ...(content.footer?.paymentGateway || {}),
          methods: content.footer?.paymentGateway?.methods && content.footer.paymentGateway.methods.length > 0
            ? content.footer.paymentGateway.methods
            : [...defaultFooterContent.paymentGateway.methods],
        },
      };
      setContent({
        ...content,
        footer: updatedFooter
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
        }
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

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Sparkles },
    { id: 'about', label: 'About Section', icon: Info },
    { id: 'whyChooseUs', label: 'Why Choose Us', icon: Star },
    { id: 'statistics', label: 'Statistics', icon: BarChart },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'photoGallery', label: 'Photo Gallery', icon: ImageIcon },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: MessageSquare },
    { id: 'reviews', label: 'Reviews Management', icon: Star },
    { id: 'downloadApp', label: 'Download App', icon: DownloadIcon },
    { id: 'footer', label: 'Footer', icon: LayoutIcon },
    { id: 'promoBanner', label: 'Promotional Banner', icon: ImageIcon },
    { id: 'courseLessonBanner', label: 'Course Lesson Banner', icon: ImageIcon },
    { id: 'sectionOrder', label: 'Section Order', icon: Settings },
    { id: 'marquee', label: 'Marquee Banner', icon: MessageSquare },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'social', label: 'Social Media', icon: LinkIcon },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'buttons', label: 'Buttons', icon: Settings },
    { id: 'mobile', label: 'Mobile Menu', icon: Globe },
  ];

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

        {/* Tabs Section */}
        <PageSection 
          title="Content Sections"
          className="mb-2 sm:mb-4"
        >
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-[#7B2CBF] text-[#7B2CBF]'
                        : 'text-gray-600 hover:text-[#7B2CBF]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </PageSection>

        {/* Content Sections */}
        <PageSection 
          title={tabs.find(t => t.id === activeTab)?.label || 'Content'}
          description={`Manage ${tabs.find(t => t.id === activeTab)?.label.toLowerCase() || 'content'} settings`}
          className="mb-2 sm:mb-4"
        >
          <div className="space-y-6">
        {/* Hero Section */}
        {activeTab === 'hero' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Hero Section Settings
              </CardTitle>
              <CardDescription>Configure the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subtitle */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Subtitle</label>
                <AttractiveInput
                  value={content.hero?.subtitle || ''}
                  onChange={(e) => updateContent(['hero', 'subtitle'], e.target.value)}
                  placeholder="Enter subtitle text"
                />
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2', 'part3', 'part4', 'part5'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.hero?.title?.[part as keyof typeof content.hero.title] || ''}
                        onChange={(e) => updateContent(['hero', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.hero?.titleColors?.[part as keyof typeof content.hero.titleColors] === 'gradient' ? '#EC4899' : content.hero?.titleColors?.[part as keyof typeof content.hero.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            const isGradient = (e.target.value === '#EC4899' && (part === 'part2' || part === 'part3'));
                            updateContent(['hero', 'titleColors', part], isGradient ? 'gradient' : e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                          disabled={(part === 'part2' && content.hero?.titleColors?.part2 === 'gradient') || (part === 'part3' && content.hero?.titleColors?.part3 === 'gradient')}
                        />
                        {(part === 'part2' || part === 'part3') && (
                          <button
                            onClick={() => {
                              const currentValue = content.hero?.titleColors?.[part as 'part2' | 'part3'];
                              updateContent(['hero', 'titleColors', part], currentValue === 'gradient' ? '#EC4899' : 'gradient');
                            }}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              content.hero?.titleColors?.[part as 'part2' | 'part3'] === 'gradient' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {content.hero?.titleColors?.[part as 'part2' | 'part3'] === 'gradient' ? '✓ Gradient' : 'Use Gradient'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Color Picker */}
              {(content.hero?.titleColors?.part2 === 'gradient' || content.hero?.titleColors?.part3 === 'gradient') && (
                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Palette className="w-4 h-4" />
                      Gradient Color Settings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Customize the gradient colors for {content.hero?.titleColors?.part2 === 'gradient' && content.hero?.titleColors?.part3 === 'gradient' 
                        ? 'part2 & part3' 
                        : content.hero?.titleColors?.part2 === 'gradient' 
                        ? 'part2' 
                        : 'part3'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* From Color */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          From Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={content.hero?.gradientColors?.from || '#10B981'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                from: e.target.value,
                              });
                            }}
                            className="h-10 w-16 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={content.hero?.gradientColors?.from || '#10B981'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                from: e.target.value,
                              });
                            }}
                            placeholder="#10B981"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>

                      {/* Via Color (Optional) */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                          Via Color (Optional)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={content.hero?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                via: e.target.value,
                              });
                            }}
                            className="h-10 w-16 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={content.hero?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                via: e.target.value || undefined,
                              });
                            }}
                            placeholder="#14B8A6"
                            className="flex-1 text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              if (currentGradient.via) {
                                const { via, ...rest } = currentGradient;
                                updateContent(['hero', 'gradientColors'], rest);
                              } else {
                                updateContent(['hero', 'gradientColors'], {
                                  ...currentGradient,
                                  via: '#14B8A6',
                                });
                              }
                            }}
                            className="text-xs px-2"
                          >
                            {content.hero?.gradientColors?.via ? 'Remove' : 'Add'}
                          </Button>
                        </div>
                      </div>

                      {/* To Color */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                          To Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={content.hero?.gradientColors?.to || '#EC4899'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                to: e.target.value,
                              });
                            }}
                            className="h-10 w-16 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={content.hero?.gradientColors?.to || '#EC4899'}
                            onChange={(e) => {
                              const currentGradient = content.hero?.gradientColors || { from: '#10B981', to: '#EC4899' };
                              updateContent(['hero', 'gradientColors'], {
                                ...currentGradient,
                                to: e.target.value,
                              });
                            }}
                            placeholder="#EC4899"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Preview */}
                    <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Preview</label>
                      <div
                        className="h-12 rounded-lg flex items-center justify-center text-lg font-bold"
                        style={{
                          backgroundImage: content.hero?.gradientColors?.via
                            ? `linear-gradient(to right, ${content.hero.gradientColors.from}, ${content.hero.gradientColors.via}, ${content.hero.gradientColors.to})`
                            : `linear-gradient(to right, ${content.hero?.gradientColors?.from || '#10B981'}, ${content.hero?.gradientColors?.to || '#EC4899'})`,
                        }}
                      >
                        <span
                          className="bg-clip-text text-transparent"
                          style={{
                            backgroundImage: content.hero?.gradientColors?.via
                              ? `linear-gradient(to right, ${content.hero.gradientColors.from}, ${content.hero.gradientColors.via}, ${content.hero.gradientColors.to})`
                              : `linear-gradient(to right, ${content.hero?.gradientColors?.from || '#10B981'}, ${content.hero?.gradientColors?.to || '#EC4899'})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {content.hero?.titleColors?.part2 === 'gradient' && content.hero?.titleColors?.part3 === 'gradient'
                            ? `${content.hero?.title?.part2 || ''} ${content.hero?.title?.part3 || ''}`
                            : content.hero?.titleColors?.part2 === 'gradient'
                            ? content.hero?.title?.part2 || 'Gradient Text'
                            : content.hero?.title?.part3 || 'Gradient Text'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        This is how your gradient will appear on the title
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Quick Presets</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Purple-Pink', from: '#A855F7', via: '#EC4899', to: '#F43F5E' },
                          { name: 'Green-Cyan', from: '#10B981', via: '#14B8A6', to: '#06B6D4' },
                          { name: 'Blue-Purple', from: '#3B82F6', via: '#8B5CF6', to: '#A855F7' },
                          { name: 'Orange-Red', from: '#F97316', via: '#EF4444', to: '#DC2626' },
                          { name: 'Rainbow', from: '#10B981', via: '#14B8A6', to: '#EC4899' },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              updateContent(['hero', 'gradientColors'], {
                                from: preset.from,
                                via: preset.via,
                                to: preset.to,
                              });
                            }}
                            className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-2"
                          >
                            <div
                              className="w-4 h-4 rounded"
                              style={{
                                backgroundImage: `linear-gradient(to right, ${preset.from}, ${preset.via}, ${preset.to})`,
                              }}
                            />
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <CustomEditor
                  value={content.hero?.description || ''}
                  onChange={(data) => updateContent(['hero', 'description'], data)}
                  placeholder="Enter description text"
                />
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Call-to-Action Buttons</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Primary Button</label>
                    <AttractiveInput
                      value={content.hero?.buttons?.primary?.text || ''}
                      onChange={(e) => updateContent(['hero', 'buttons', 'primary', 'text'], e.target.value)}
                      placeholder="Button text"
                      className="mb-2"
                    />
                    <AttractiveInput
                      value={content.hero?.buttons?.primary?.href || ''}
                      onChange={(e) => updateContent(['hero', 'buttons', 'primary', 'href'], e.target.value)}
                      placeholder="/href"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Secondary Button</label>
                    <AttractiveInput
                      value={content.hero?.buttons?.secondary?.text || ''}
                      onChange={(e) => updateContent(['hero', 'buttons', 'secondary', 'text'], e.target.value)}
                      placeholder="Button text"
                      className="mb-2"
                    />
                    <AttractiveInput
                      value={content.hero?.buttons?.secondary?.href || ''}
                      onChange={(e) => updateContent(['hero', 'buttons', 'secondary', 'href'], e.target.value)}
                      placeholder="/href"
                    />
                  </div>
                </div>
              </div>

              {/* Carousel Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold">Carousel Settings</label>
                    <p className="text-sm text-gray-500">Manage course carousel</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs">Enabled</label>
                      <button
                        onClick={() => updateContent(['hero', 'carousel', 'enabled'], !content.hero?.carousel?.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          content.hero?.carousel?.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            content.hero?.carousel?.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs">Auto Play</label>
                      <button
                        onClick={() => updateContent(['hero', 'carousel', 'autoPlay'], !content.hero?.carousel?.autoPlay)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          content.hero?.carousel?.autoPlay ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            content.hero?.carousel?.autoPlay ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                {content.hero?.carousel?.enabled && (
                  <>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Auto Play Interval (ms)</label>
                      <Input
                        type="number"
                        value={content.hero?.carousel?.autoPlayInterval || 3000}
                        onChange={(e) => updateContent(['hero', 'carousel', 'autoPlayInterval'], parseInt(e.target.value))}
                        min={1000}
                        step={500}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Carousel Items</label>
                      {content.hero?.carousel?.items?.map((item, index) => (
                        <Card key={item.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-700">
                                Carousel Item {index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete this item"
                                onClick={() => {
                                  const newItems = content.hero?.carousel?.items?.filter((_, i) => i !== index) || [];
                                  updateContent(['hero', 'carousel', 'items'], newItems);
                                }}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                            <AttractiveInput
                              value={item.image}
                              onChange={(e) => {
                                const newItems = [...(content.hero?.carousel?.items || [])];
                                newItems[index] = { ...newItems[index], image: e.target.value };
                                updateContent(['hero', 'carousel', 'items'], newItems);
                              }}
                              placeholder="Image URL"
                            />
                            <AttractiveInput
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...(content.hero?.carousel?.items || [])];
                                newItems[index] = { ...newItems[index], title: e.target.value };
                                updateContent(['hero', 'carousel', 'items'], newItems);
                              }}
                              placeholder="Course title"
                            />
                            <AttractiveInput
                              value={item.category}
                              onChange={(e) => {
                                const newItems = [...(content.hero?.carousel?.items || [])];
                                newItems[index] = { ...newItems[index], category: e.target.value };
                                updateContent(['hero', 'carousel', 'items'], newItems);
                              }}
                              placeholder="Category"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newItems = [...(content.hero?.carousel?.items || [])];
                                  updateContent(['hero', 'carousel', 'items'], newItems);
                                }}
                              >
                                Update Item
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newItems = content.hero?.carousel?.items?.filter((_, i) => i !== index) || [];
                                  updateContent(['hero', 'carousel', 'items'], newItems);
                                }}
                              >
                                Delete Item
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newItems = [...(content.hero?.carousel?.items || [])];
                          newItems.push({
                            id: Date.now(),
                            image: '',
                            title: '',
                            category: '',
                          });
                          updateContent(['hero', 'carousel', 'items'], newItems);
                        }}
                      >
                        Add Item
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Statistics Cards</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold">Students Card</label>
                      <button
                        onClick={() => updateContent(['hero', 'stats', 'students', 'enabled'], !content.hero?.stats?.students?.enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          content.hero?.stats?.students?.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            content.hero?.stats?.students?.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <AttractiveInput
                      value={content.hero?.stats?.students?.count || ''}
                      onChange={(e) => updateContent(['hero', 'stats', 'students', 'count'], e.target.value)}
                      placeholder="Student count text"
                      className="mb-2"
                    />
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600">Avatar URLs</label>
                      {content.hero?.stats?.students?.avatars?.map((avatar, index) => (
                        <div key={index} className="flex gap-2">
                          <AttractiveInput
                            value={avatar}
                            onChange={(e) => {
                              const newAvatars = [...(content.hero?.stats?.students?.avatars || [])];
                              newAvatars[index] = e.target.value;
                              updateContent(['hero', 'stats', 'students', 'avatars'], newAvatars);
                            }}
                            placeholder="Avatar URL"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newAvatars = content.hero?.stats?.students?.avatars?.filter((_, i) => i !== index) || [];
                              updateContent(['hero', 'stats', 'students', 'avatars'], newAvatars);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newAvatars = [...(content.hero?.stats?.students?.avatars || []), ''];
                          updateContent(['hero', 'stats', 'students', 'avatars'], newAvatars);
                        }}
                      >
                        Add Avatar
                      </Button>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold">Courses Card</label>
                      <button
                        onClick={() => updateContent(['hero', 'stats', 'courses', 'enabled'], !content.hero?.stats?.courses?.enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          content.hero?.stats?.courses?.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            content.hero?.stats?.courses?.enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <AttractiveInput
                      value={content.hero?.stats?.courses?.count || ''}
                      onChange={(e) => updateContent(['hero', 'stats', 'courses', 'count'], e.target.value)}
                      placeholder="Course count text"
                    />
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About Section */}
        {activeTab === 'about' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                About Section Settings
              </CardTitle>
              <CardDescription>Configure the about section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.about?.label?.text || ''}
                    onChange={(e) => updateContent(['about', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.about?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['about', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.about?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['about', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2', 'part3', 'part4', 'part5'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.about?.title?.[part as keyof typeof content.about.title] || ''}
                        onChange={(e) => updateContent(['about', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.about?.titleColors?.[part as keyof typeof content.about.titleColors] || '#1E3A8A'}
                          onChange={(e) => updateContent(['about', 'titleColors', part], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.about?.titleColors?.[part as keyof typeof content.about.titleColors] || '#1E3A8A'}
                          onChange={(e) => updateContent(['about', 'titleColors', part], e.target.value)}
                          placeholder="#1E3A8A"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <CustomEditor
                  value={content.about?.description || ''}
                  onChange={(data) => updateContent(['about', 'description'], data)}
                  placeholder="Enter description text"
                />
              </div>

              {/* Features */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Features</label>
                {(content.about?.features && content.about.features.length > 0 ? content.about.features : defaultAboutContent.features).map((feature, index) => {
                  const currentFeatures = content.about?.features && content.about.features.length > 0 
                    ? content.about.features 
                    : defaultAboutContent.features;
                  return (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Feature {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete this feature"
                            onClick={() => {
                              const newFeatures = currentFeatures.filter((_, i) => i !== index);
                              updateContent(['about', 'features'], newFeatures.length > 0 ? newFeatures : defaultAboutContent.features);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <AttractiveInput
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...currentFeatures];
                            newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                            updateContent(['about', 'features'], newFeatures);
                          }}
                          placeholder="Feature title"
                          className="mb-2"
                        />
                        <CustomEditor
                          value={feature.description}
                          onChange={(data) => {
                            const newFeatures = [...currentFeatures];
                            newFeatures[index] = { ...newFeatures[index], description: data };
                            updateContent(['about', 'features'], newFeatures);
                          }}
                          placeholder="Feature description"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateContent(['about', 'features'], [...currentFeatures]);
                            }}
                          >
                            Update Feature
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newFeatures = currentFeatures.filter((_, i) => i !== index);
                              updateContent(['about', 'features'], newFeatures.length > 0 ? newFeatures : defaultAboutContent.features);
                            }}
                          >
                            Delete Feature
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.about?.features || content.about.features.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default features. Click "Add Feature" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentFeatures = content.about?.features && content.about.features.length > 0 
                      ? content.about.features 
                      : defaultAboutContent.features;
                    const newFeatures = [...currentFeatures, { title: '', description: '' }];
                    updateContent(['about', 'features'], newFeatures);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              {/* Button */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Call-to-Action Button</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.about?.button?.text || ''}
                    onChange={(e) => updateContent(['about', 'button', 'text'], e.target.value)}
                    placeholder="Button text"
                  />
                  <AttractiveInput
                    value={content.about?.button?.href || ''}
                    onChange={(e) => updateContent(['about', 'button', 'href'], e.target.value)}
                    placeholder="/href"
                  />
                </div>
              </div>

              {/* Experience Box */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Experience Box</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.about?.experience?.number || ''}
                    onChange={(e) => updateContent(['about', 'experience', 'number'], e.target.value)}
                    placeholder="Experience number (e.g., ৩০+)"
                  />
                  <AttractiveInput
                    value={content.about?.experience?.label || ''}
                    onChange={(e) => updateContent(['about', 'experience', 'label'], e.target.value)}
                    placeholder="Experience label"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient From</label>
                    <input
                      type="color"
                      value={content.about?.experience?.gradientFrom || '#FF6B35'}
                      onChange={(e) => updateContent(['about', 'experience', 'gradientFrom'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.about?.experience?.gradientFrom || '#FF6B35'}
                      onChange={(e) => updateContent(['about', 'experience', 'gradientFrom'], e.target.value)}
                      placeholder="#FF6B35"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient To</label>
                    <input
                      type="color"
                      value={content.about?.experience?.gradientTo || '#EC4899'}
                      onChange={(e) => updateContent(['about', 'experience', 'gradientTo'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.about?.experience?.gradientTo || '#EC4899'}
                      onChange={(e) => updateContent(['about', 'experience', 'gradientTo'], e.target.value)}
                      placeholder="#EC4899"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div
                    className="rounded-full px-6 py-4 text-center"
                    style={{
                      background: `linear-gradient(to right, ${content.about?.experience?.gradientFrom || '#FF6B35'}, ${content.about?.experience?.gradientTo || '#EC4899'})`,
                      borderRadius: "9999px",
                      aspectRatio: "2.5/1",
                    }}
                  >
                    <div className="text-3xl font-bold text-white">
                      {content.about?.experience?.number || '৩০+'}
                    </div>
                    <div className="text-xs font-semibold text-white mt-1">
                      {content.about?.experience?.label || 'বছরের অভিজ্ঞতা'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Images</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Main Image URL</label>
                    <AttractiveInput
                      value={content.about?.images?.main || ''}
                      onChange={(e) => updateContent(['about', 'images', 'main'], e.target.value)}
                      placeholder="Main image URL"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Secondary Image URL</label>
                    <AttractiveInput
                      value={content.about?.images?.secondary || ''}
                      onChange={(e) => updateContent(['about', 'images', 'secondary'], e.target.value)}
                      placeholder="Secondary image URL"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Why Choose Us Section */}
        {activeTab === 'whyChooseUs' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Why Choose Us Section Settings
              </CardTitle>
              <CardDescription>Configure the why choose us section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.whyChooseUs?.label?.text || ''}
                    onChange={(e) => updateContent(['whyChooseUs', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.whyChooseUs?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['whyChooseUs', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.whyChooseUs?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['whyChooseUs', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2', 'part3', 'part4', 'part5'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.whyChooseUs?.title?.[part as keyof typeof content.whyChooseUs.title] || ''}
                        onChange={(e) => updateContent(['whyChooseUs', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.whyChooseUs?.titleColors?.[part as keyof typeof content.whyChooseUs.titleColors] || '#1E3A8A'}
                          onChange={(e) => updateContent(['whyChooseUs', 'titleColors', part], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.whyChooseUs?.titleColors?.[part as keyof typeof content.whyChooseUs.titleColors] || '#1E3A8A'}
                          onChange={(e) => updateContent(['whyChooseUs', 'titleColors', part], e.target.value)}
                          placeholder="#1E3A8A"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <CustomEditor
                  value={content.whyChooseUs?.description || ''}
                  onChange={(data) => updateContent(['whyChooseUs', 'description'], data)}
                  placeholder="Enter description text"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Image URL</label>
                <AttractiveInput
                  value={content.whyChooseUs?.image || ''}
                  onChange={(e) => updateContent(['whyChooseUs', 'image'], e.target.value)}
                  placeholder="Image URL"
                />
              </div>

              {/* Features */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Features</label>
                {(content.whyChooseUs?.features && content.whyChooseUs.features.length > 0 ? content.whyChooseUs.features : defaultWhyChooseUsContent.features).map((feature, index) => {
                  const currentFeatures = content.whyChooseUs?.features && content.whyChooseUs.features.length > 0 
                    ? content.whyChooseUs.features 
                    : defaultWhyChooseUsContent.features;
                  return (
                    <Card key={feature.id || index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Feature {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete this feature"
                            onClick={() => {
                              const newFeatures = currentFeatures.filter((_, i) => i !== index);
                              updateContent(['whyChooseUs', 'features'], newFeatures.length > 0 ? newFeatures : defaultWhyChooseUsContent.features);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AttractiveInput
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...currentFeatures];
                              newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                              updateContent(['whyChooseUs', 'features'], newFeatures);
                            }}
                            placeholder="Feature title (English)"
                            className="mb-2"
                          />
                          <AttractiveInput
                            value={feature.titleBn}
                            onChange={(e) => {
                              const newFeatures = [...currentFeatures];
                              newFeatures[index] = { ...newFeatures[index], titleBn: e.target.value };
                              updateContent(['whyChooseUs', 'features'], newFeatures);
                            }}
                            placeholder="Feature title (Bengali)"
                            className="mb-2"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CustomEditor
                            value={feature.description}
                            onChange={(data) => {
                              const newFeatures = [...currentFeatures];
                              newFeatures[index] = { ...newFeatures[index], description: data };
                              updateContent(['whyChooseUs', 'features'], newFeatures);
                            }}
                            placeholder="Description (English)"
                          />
                          <CustomEditor
                            value={feature.descriptionBn}
                            onChange={(data) => {
                              const newFeatures = [...currentFeatures];
                              newFeatures[index] = { ...newFeatures[index], descriptionBn: data };
                              updateContent(['whyChooseUs', 'features'], newFeatures);
                            }}
                            placeholder="Description (Bengali)"
                          />
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div className="min-w-[180px]">
                            <label className="text-xs text-gray-600 mb-1 block">Icon Type</label>
                            <select
                              value={feature.iconType}
                              onChange={(e) => {
                                const newFeatures = [...currentFeatures];
                                newFeatures[index] = { ...newFeatures[index], iconType: e.target.value as 'money' | 'instructor' | 'flexible' | 'community' };
                                updateContent(['whyChooseUs', 'features'], newFeatures);
                              }}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                            >
                              <option value="money">Money</option>
                              <option value="instructor">Instructor</option>
                              <option value="flexible">Flexible</option>
                              <option value="community">Community</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Values are already kept in sync as you type,
                                // this button is provided for clarity in the UI.
                                updateContent(['whyChooseUs', 'features'], [...currentFeatures]);
                              }}
                            >
                              Update Feature
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newFeatures = currentFeatures.filter((_, i) => i !== index);
                                updateContent(['whyChooseUs', 'features'], newFeatures.length > 0 ? newFeatures : defaultWhyChooseUsContent.features);
                              }}
                            >
                              Delete Feature
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.whyChooseUs?.features || content.whyChooseUs.features.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default features. Click "Add Feature" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentFeatures = content.whyChooseUs?.features && content.whyChooseUs.features.length > 0 
                      ? content.whyChooseUs.features 
                      : defaultWhyChooseUsContent.features;
                    const maxId = currentFeatures.length > 0 ? Math.max(...currentFeatures.map(f => f.id)) : 0;
                    const newFeatures = [...currentFeatures, { 
                      id: maxId + 1, 
                      title: '', 
                      titleBn: '',
                      description: '', 
                      descriptionBn: '',
                      iconType: 'money' as const
                    }];
                    updateContent(['whyChooseUs', 'features'], newFeatures);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Section */}
        {activeTab === 'statistics' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Statistics Section Settings
              </CardTitle>
              <CardDescription>Configure the statistics section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics Items */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Statistics Items</label>
                {(content.statistics?.items && content.statistics.items.length > 0 ? content.statistics.items : defaultStatisticsContent.items).map((item, index) => {
                  const currentItems = content.statistics?.items && content.statistics.items.length > 0 
                    ? content.statistics.items 
                    : defaultStatisticsContent.items;
                  return (
                    <Card key={item.id || index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Statistics Item {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete this item"
                            onClick={() => {
                              const newItems = currentItems.filter((_, i) => i !== index);
                              updateContent(['statistics', 'items'], newItems.length > 0 ? newItems : defaultStatisticsContent.items);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AttractiveInput
                            value={item.number}
                            onChange={(e) => {
                              const newItems = [...currentItems];
                              newItems[index] = { ...newItems[index], number: e.target.value };
                              updateContent(['statistics', 'items'], newItems);
                            }}
                            placeholder="Number (e.g., 150)"
                            className="mb-2"
                          />
                          <AttractiveInput
                            value={item.suffix}
                            onChange={(e) => {
                              const newItems = [...currentItems];
                              newItems[index] = { ...newItems[index], suffix: e.target.value };
                              updateContent(['statistics', 'items'], newItems);
                            }}
                            placeholder="Suffix (e.g., k, K, +)"
                            className="mb-2"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AttractiveInput
                            value={item.label}
                            onChange={(e) => {
                              const newItems = [...currentItems];
                              newItems[index] = { ...newItems[index], label: e.target.value };
                              updateContent(['statistics', 'items'], newItems);
                            }}
                            placeholder="Label (English)"
                          />
                          <AttractiveInput
                            value={item.labelBengali}
                            onChange={(e) => {
                              const newItems = [...currentItems];
                              newItems[index] = { ...newItems[index], labelBengali: e.target.value };
                              updateContent(['statistics', 'items'], newItems);
                            }}
                            placeholder="Label (Bengali)"
                          />
                        </div>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-xs text-gray-600 mb-1 block">Icon Type</label>
                            <select
                              value={item.iconType}
                              onChange={(e) => {
                                const newItems = [...currentItems];
                                newItems[index] = { ...newItems[index], iconType: e.target.value as 'students' | 'courses' | 'tutors' | 'awards' };
                                updateContent(['statistics', 'items'], newItems);
                              }}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                            >
                              <option value="students">Students</option>
                              <option value="courses">Courses</option>
                              <option value="tutors">Tutors</option>
                              <option value="awards">Awards</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateContent(['statistics', 'items'], [...currentItems]);
                              }}
                            >
                              Update Item
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newItems = currentItems.filter((_, i) => i !== index);
                                updateContent(['statistics', 'items'], newItems.length > 0 ? newItems : defaultStatisticsContent.items);
                              }}
                            >
                              Delete Item
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.statistics?.items || content.statistics.items.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default statistics items. Click "Add Item" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentItems = content.statistics?.items && content.statistics.items.length > 0 
                      ? content.statistics.items 
                      : defaultStatisticsContent.items;
                    const maxId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) : 0;
                    const newItems = [...currentItems, { 
                      id: maxId + 1, 
                      number: '', 
                      suffix: '',
                      label: '', 
                      labelBengali: '',
                      iconType: 'students' as const
                    }];
                    updateContent(['statistics', 'items'], newItems);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Statistics Item
                  </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Section */}
        {activeTab === 'services' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Services Section Settings
              </CardTitle>
              <CardDescription>Configure the services section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.services?.label?.text || ''}
                    onChange={(e) => updateContent(['services', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.services?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['services', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.services?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['services', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.services?.title?.[part as keyof typeof content.services.title] || ''}
                        onChange={(e) => updateContent(['services', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        {part === 'part2' && (
                          <button
                            onClick={() => updateContent(['services', 'titleColors', part], content.services?.titleColors?.[part as keyof typeof content.services.titleColors] === 'gradient' ? '#10B981' : 'gradient')}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              content.services?.titleColors?.[part as keyof typeof content.services.titleColors] === 'gradient'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {content.services?.titleColors?.[part as keyof typeof content.services.titleColors] === 'gradient' ? '✓ Gradient' : 'Use Gradient'}
                          </button>
                        )}
                        <input
                          type="color"
                          value={content.services?.titleColors?.[part as keyof typeof content.services.titleColors] === 'gradient' ? '#10B981' : content.services?.titleColors?.[part as keyof typeof content.services.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            const isGradient = part === 'part2' && e.target.value === '#10B981';
                            updateContent(['services', 'titleColors', part], isGradient ? 'gradient' : e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                          disabled={part === 'part2' && content.services?.titleColors?.part2 === 'gradient'}
                        />
                        <Input
                          type="text"
                          value={content.services?.titleColors?.[part as keyof typeof content.services.titleColors] === 'gradient' ? '#10B981' : content.services?.titleColors?.[part as keyof typeof content.services.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            const isGradient = part === 'part2' && e.target.value === '#10B981';
                            updateContent(['services', 'titleColors', part], isGradient ? 'gradient' : e.target.value);
                          }}
                          placeholder={part === 'part1' ? '#1E3A8A' : '#10B981'}
                          className="flex-1 text-xs"
                          disabled={part === 'part2' && content.services?.titleColors?.part2 === 'gradient'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Colors (if part2 is gradient) */}
              {content.services?.titleColors?.part2 === 'gradient' && (
                <Card className="p-4 bg-purple-50">
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Gradient Colors</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">From</label>
                          <input
                            type="color"
                            value={content.services?.gradientColors?.from || '#A855F7'}
                            onChange={(e) => updateContent(['services', 'gradientColors', 'from'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.services?.gradientColors?.from || '#A855F7'}
                            onChange={(e) => updateContent(['services', 'gradientColors', 'from'], e.target.value)}
                            placeholder="#A855F7"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">To</label>
                          <input
                            type="color"
                            value={content.services?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['services', 'gradientColors', 'to'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.services?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['services', 'gradientColors', 'to'], e.target.value)}
                            placeholder="#10B981"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div className="text-2xl font-bold">
                          <span style={{ color: content.services?.titleColors?.part1 || '#1E3A8A' }}>
                            {content.services?.title?.part1 || 'আমাদের'}
                          </span>{" "}
                          <span
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${content.services?.gradientColors?.from || '#A855F7'}, ${content.services?.gradientColors?.to || '#10B981'})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {content.services?.title?.part2 || 'সেবা'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This is how your gradient will appear on the title
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Batch Section (Frontend Dynamic Content) */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Batch Section (Frontend)</label>

                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <AttractiveInput
                      value={content.services?.batchSection?.onlineButtonLabel || defaultServicesContent.batchSection?.onlineButtonLabel || ''}
                      onChange={(e) => updateContent(['services', 'batchSection', 'onlineButtonLabel'], e.target.value)}
                      placeholder="Online button label"
                    />
                    <AttractiveInput
                      value={content.services?.batchSection?.offlineButtonLabel || defaultServicesContent.batchSection?.offlineButtonLabel || ''}
                      onChange={(e) => updateContent(['services', 'batchSection', 'offlineButtonLabel'], e.target.value)}
                      placeholder="Offline button label"
                    />
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Default Active Tab</label>
                      <select
                        value={content.services?.batchSection?.defaultActiveTab || defaultServicesContent.batchSection?.defaultActiveTab || 'online'}
                        onChange={(e) => updateContent(['services', 'batchSection', 'defaultActiveTab'], e.target.value as 'online' | 'offline')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-gray-700 block">Online Batch Background</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['from', 'via', 'to'] as const).map((stop) => (
                        <div key={`online-bg-${stop}`} className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 capitalize">{stop}</label>
                          <input
                            type="color"
                            value={content.services?.batchSection?.onlineBackground?.[stop] || defaultServicesContent.batchSection?.onlineBackground?.[stop] || '#000000'}
                            onChange={(e) => updateContent(['services', 'batchSection', 'onlineBackground', stop], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.services?.batchSection?.onlineBackground?.[stop] || defaultServicesContent.batchSection?.onlineBackground?.[stop] || '#000000'}
                            onChange={(e) => updateContent(['services', 'batchSection', 'onlineBackground', stop], e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-gray-700 block">Offline Batch Background</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(['from', 'via', 'to'] as const).map((stop) => (
                        <div key={`offline-bg-${stop}`} className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 capitalize">{stop}</label>
                          <input
                            type="color"
                            value={content.services?.batchSection?.offlineBackground?.[stop] || defaultServicesContent.batchSection?.offlineBackground?.[stop] || '#000000'}
                            onChange={(e) => updateContent(['services', 'batchSection', 'offlineBackground', stop], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.services?.batchSection?.offlineBackground?.[stop] || defaultServicesContent.batchSection?.offlineBackground?.[stop] || '#000000'}
                            onChange={(e) => updateContent(['services', 'batchSection', 'offlineBackground', stop], e.target.value)}
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-700 block">Online Levels</label>
                      {(content.services?.batchSection?.onlineLevels && content.services.batchSection.onlineLevels.length > 0
                        ? content.services.batchSection.onlineLevels
                        : defaultServicesContent.batchSection?.onlineLevels || []
                      ).map((item, index) => {
                        const currentLevels =
                          content.services?.batchSection?.onlineLevels &&
                          content.services.batchSection.onlineLevels.length > 0
                            ? content.services.batchSection.onlineLevels
                            : defaultServicesContent.batchSection?.onlineLevels || [];
                        return (
                          <div key={`${item.id}-${index}`} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-600">Online Level {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  const newLevels = currentLevels.filter((_, i) => i !== index);
                                  updateContent(['services', 'batchSection', 'onlineLevels'], newLevels.length > 0 ? newLevels : defaultServicesContent.batchSection?.onlineLevels || []);
                                }}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <AttractiveInput
                                value={item.label}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], label: e.target.value };
                                  updateContent(['services', 'batchSection', 'onlineLevels'], newLevels);
                                }}
                                placeholder="Label"
                              />
                              <AttractiveInput
                                value={item.id}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], id: e.target.value };
                                  updateContent(['services', 'batchSection', 'onlineLevels'], newLevels);
                                }}
                                placeholder="ID"
                              />
                            </div>
                            <AttractiveInput
                              value={item.subtitle}
                              onChange={(e) => {
                                const newLevels = [...currentLevels];
                                newLevels[index] = { ...newLevels[index], subtitle: e.target.value };
                                updateContent(['services', 'batchSection', 'onlineLevels'], newLevels);
                              }}
                              placeholder="Subtitle"
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">Color</label>
                              <input
                                type="color"
                                value={item.color}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], color: e.target.value };
                                  updateContent(['services', 'batchSection', 'onlineLevels'], newLevels);
                                }}
                                className="h-8 w-16 rounded border"
                              />
                              <Input
                                type="text"
                                value={item.color}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], color: e.target.value };
                                  updateContent(['services', 'batchSection', 'onlineLevels'], newLevels);
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentLevels =
                            content.services?.batchSection?.onlineLevels &&
                            content.services.batchSection.onlineLevels.length > 0
                              ? content.services.batchSection.onlineLevels
                              : defaultServicesContent.batchSection?.onlineLevels || [];
                          const newLevel = {
                            id: `online-${currentLevels.length + 1}`,
                            label: '',
                            subtitle: '',
                            color: '#2563EB',
                          };
                          updateContent(['services', 'batchSection', 'onlineLevels'], [...currentLevels, newLevel]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Online Level
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-gray-700 block">Offline Levels</label>
                      {(content.services?.batchSection?.offlineLevels && content.services.batchSection.offlineLevels.length > 0
                        ? content.services.batchSection.offlineLevels
                        : defaultServicesContent.batchSection?.offlineLevels || []
                      ).map((item, index) => {
                        const currentLevels =
                          content.services?.batchSection?.offlineLevels &&
                          content.services.batchSection.offlineLevels.length > 0
                            ? content.services.batchSection.offlineLevels
                            : defaultServicesContent.batchSection?.offlineLevels || [];
                        return (
                          <div key={`${item.id}-${index}`} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-600">Offline Level {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  const newLevels = currentLevels.filter((_, i) => i !== index);
                                  updateContent(['services', 'batchSection', 'offlineLevels'], newLevels.length > 0 ? newLevels : defaultServicesContent.batchSection?.offlineLevels || []);
                                }}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <AttractiveInput
                                value={item.label}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], label: e.target.value };
                                  updateContent(['services', 'batchSection', 'offlineLevels'], newLevels);
                                }}
                                placeholder="Label"
                              />
                              <AttractiveInput
                                value={item.id}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], id: e.target.value };
                                  updateContent(['services', 'batchSection', 'offlineLevels'], newLevels);
                                }}
                                placeholder="ID"
                              />
                            </div>
                            <AttractiveInput
                              value={item.subtitle}
                              onChange={(e) => {
                                const newLevels = [...currentLevels];
                                newLevels[index] = { ...newLevels[index], subtitle: e.target.value };
                                updateContent(['services', 'batchSection', 'offlineLevels'], newLevels);
                              }}
                              placeholder="Subtitle"
                            />
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">Color</label>
                              <input
                                type="color"
                                value={item.color}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], color: e.target.value };
                                  updateContent(['services', 'batchSection', 'offlineLevels'], newLevels);
                                }}
                                className="h-8 w-16 rounded border"
                              />
                              <Input
                                type="text"
                                value={item.color}
                                onChange={(e) => {
                                  const newLevels = [...currentLevels];
                                  newLevels[index] = { ...newLevels[index], color: e.target.value };
                                  updateContent(['services', 'batchSection', 'offlineLevels'], newLevels);
                                }}
                                className="text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentLevels =
                            content.services?.batchSection?.offlineLevels &&
                            content.services.batchSection.offlineLevels.length > 0
                              ? content.services.batchSection.offlineLevels
                              : defaultServicesContent.batchSection?.offlineLevels || [];
                          const newLevel = {
                            id: `offline-${currentLevels.length + 1}`,
                            label: '',
                            subtitle: '',
                            color: '#0EA5E9',
                          };
                          updateContent(['services', 'batchSection', 'offlineLevels'], [...currentLevels, newLevel]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Offline Level
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Services Items */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Services</label>
                {(content.services?.services && content.services.services.length > 0 ? content.services.services : defaultServicesContent.services).map((service, index) => {
                  const currentServices = content.services?.services && content.services.services.length > 0 
                    ? content.services.services 
                    : defaultServicesContent.services;
                  return (
                    <Card key={service.id || index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Service {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete this service"
                            onClick={() => {
                              const newServices = currentServices.filter((_, i) => i !== index);
                              updateContent(['services', 'services'], newServices.length > 0 ? newServices : defaultServicesContent.services);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AttractiveInput
                            value={service.title}
                            onChange={(e) => {
                              const newServices = [...currentServices];
                              newServices[index] = { ...newServices[index], title: e.target.value };
                              updateContent(['services', 'services'], newServices);
                            }}
                            placeholder="Service title (English)"
                            className="mb-2"
                          />
                          <AttractiveInput
                            value={service.titleBengali}
                            onChange={(e) => {
                              const newServices = [...currentServices];
                              newServices[index] = { ...newServices[index], titleBengali: e.target.value };
                              updateContent(['services', 'services'], newServices);
                            }}
                            placeholder="Service title (Bengali)"
                            className="mb-2"
                          />
                        </div>
                        <CustomEditor
                          value={service.description}
                          onChange={(data) => {
                            const newServices = [...currentServices];
                            newServices[index] = { ...newServices[index], description: data };
                            updateContent(['services', 'services'], newServices);
                          }}
                          placeholder="Service description"
                        />
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-xs text-gray-600 mb-1 block">Icon Type</label>
                            <select
                              value={service.iconType}
                              onChange={(e) => {
                                const newServices = [...currentServices];
                                newServices[index] = { ...newServices[index], iconType: e.target.value as 'online-courses' | 'live-classes' | 'certification' | 'expert-support' | 'career-guidance' | 'lifetime-access' };
                                updateContent(['services', 'services'], newServices);
                              }}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                            >
                              <option value="online-courses">Online Courses</option>
                              <option value="live-classes">Live Classes</option>
                              <option value="certification">Certification</option>
                              <option value="expert-support">Expert Support</option>
                              <option value="career-guidance">Career Guidance</option>
                              <option value="lifetime-access">Lifetime Access</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateContent(['services', 'services'], [...currentServices]);
                              }}
                            >
                              Update Service
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newServices = currentServices.filter((_, i) => i !== index);
                                updateContent(['services', 'services'], newServices.length > 0 ? newServices : defaultServicesContent.services);
                              }}
                            >
                              Delete Service
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.services?.services || content.services.services.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default services. Click "Add Service" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentServices = content.services?.services && content.services.services.length > 0 
                      ? content.services.services 
                      : defaultServicesContent.services;
                    const maxId = currentServices.length > 0 ? Math.max(...currentServices.map(s => s.id)) : 0;
                    const newServices = [...currentServices, { 
                      id: maxId + 1, 
                      title: '', 
                      titleBengali: '',
                      description: '', 
                      iconType: 'online-courses' as const
                    }];
                    updateContent(['services', 'services'], newServices);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates Section */}
        {activeTab === 'certificates' && content && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificates Section Settings
                </CardTitle>
                <CardDescription>Configure the certificates section content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Label */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Label</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AttractiveInput
                      value={content.certificates?.label?.text || ''}
                      onChange={(e) => updateContent(['certificates', 'label', 'text'], e.target.value)}
                      placeholder="Label text"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Background Color</label>
                      <input
                        type="color"
                        value={content.certificates?.label?.backgroundColor || '#A855F7'}
                        onChange={(e) => updateContent(['certificates', 'label', 'backgroundColor'], e.target.value)}
                        className="h-8 w-16 rounded border"
                      />
                      <Input
                        type="text"
                        value={content.certificates?.label?.backgroundColor || '#A855F7'}
                        onChange={(e) => updateContent(['certificates', 'label', 'backgroundColor'], e.target.value)}
                        placeholder="#A855F7"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Title Parts */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['part1', 'part2'].map((part) => (
                      <div key={part}>
                        <AttractiveInput
                          value={content.certificates?.title?.[part as keyof typeof content.certificates.title] || ''}
                          onChange={(e) => updateContent(['certificates', 'title', part], e.target.value)}
                          placeholder={`Title ${part}`}
                          className="mb-2"
                        />
                        <div className="flex items-center gap-2">
                          {part === 'part2' && (
                            <button
                              onClick={() => updateContent(['certificates', 'titleColors', part], content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] === 'gradient' ? '#10B981' : 'gradient')}
                              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                                content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] === 'gradient'
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] === 'gradient' ? '✓ Gradient' : 'Use Gradient'}
                            </button>
                          )}
                          <input
                            type="color"
                            value={content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] === 'gradient' ? '#10B981' : content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] || '#1E3A8A'}
                            onChange={(e) => {
                              updateContent(['certificates', 'titleColors', part], e.target.value);
                            }}
                            className="h-8 w-16 rounded border"
                            disabled={part === 'part2' && content.certificates?.titleColors?.part2 === 'gradient'}
                          />
                          <Input
                            type="text"
                            value={content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] === 'gradient' ? '#10B981' : content.certificates?.titleColors?.[part as keyof typeof content.certificates.titleColors] || '#1E3A8A'}
                            onChange={(e) => {
                              if (part === 'part2' && e.target.value === 'gradient') {
                                updateContent(['certificates', 'titleColors', part], 'gradient');
                              } else {
                                updateContent(['certificates', 'titleColors', part], e.target.value);
                              }
                            }}
                            placeholder={part === 'part1' ? '#1E3A8A' : '#10B981'}
                            className="flex-1 text-xs"
                            disabled={part === 'part2' && content.certificates?.titleColors?.part2 === 'gradient'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gradient Colors (if part2 is gradient) */}
                {content.certificates?.titleColors?.part2 === 'gradient' && (
                  <Card className="p-4 bg-purple-50">
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-2 block">Gradient Colors</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">From</label>
                            <input
                              type="color"
                              value={content.certificates?.gradientColors?.from || '#10B981'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'from'], e.target.value)}
                              className="h-8 w-16 rounded border"
                            />
                            <Input
                              type="text"
                              value={content.certificates?.gradientColors?.from || '#10B981'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'from'], e.target.value)}
                              placeholder="#10B981"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">Via (Optional)</label>
                            <input
                              type="color"
                              value={content.certificates?.gradientColors?.via || '#14B8A6'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'via'], e.target.value)}
                              className="h-8 w-16 rounded border"
                            />
                            <Input
                              type="text"
                              value={content.certificates?.gradientColors?.via || '#14B8A6'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'via'], e.target.value)}
                              placeholder="#14B8A6"
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600">To</label>
                            <input
                              type="color"
                              value={content.certificates?.gradientColors?.to || '#A855F7'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'to'], e.target.value)}
                              className="h-8 w-16 rounded border"
                            />
                            <Input
                              type="text"
                              value={content.certificates?.gradientColors?.to || '#A855F7'}
                              onChange={(e) => updateContent(['certificates', 'gradientColors', 'to'], e.target.value)}
                              placeholder="#A855F7"
                              className="flex-1 text-xs"
                            />
                          </div>
                        </div>
                        {/* Preview */}
                        <div className="mt-4 p-4 bg-white rounded-lg border">
                          <p className="text-xs text-gray-600 mb-2">Preview:</p>
                          <div className="text-2xl font-bold">
                            <span style={{ color: content.certificates?.titleColors?.part1 || '#1E3A8A' }}>
                              {content.certificates?.title?.part1 || 'সার্টিফিকেট'}
                            </span>{" "}
                            <span
                              className="bg-clip-text text-transparent"
                              style={{
                                backgroundImage: content.certificates?.gradientColors?.via
                                  ? `linear-gradient(to right, ${content.certificates.gradientColors.from || '#10B981'}, ${content.certificates.gradientColors.via}, ${content.certificates.gradientColors.to || '#A855F7'})`
                                  : `linear-gradient(to right, ${content.certificates?.gradientColors?.from || '#10B981'}, ${content.certificates?.gradientColors?.to || '#A855F7'})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }}
                            >
                              {content.certificates?.title?.part2 || 'নমুনা'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            This is how your gradient will appear on the title
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certificates Items - Grouped in Pairs */}
                <div className="space-y-6">
                  <label className="text-sm font-semibold mb-2 block">Certificates (Created in Pairs)</label>
                  {(() => {
                    const currentCertificates = Array.isArray(content.certificates?.certificates)
                      ? content.certificates.certificates
                      : defaultCertificatesContent.certificates;
                    
                    // Group certificates into pairs
                    const pairs: Array<Array<typeof currentCertificates[0]>> = [];
                    for (let i = 0; i < currentCertificates.length; i += 2) {
                      pairs.push(currentCertificates.slice(i, i + 2));
                    }
                    
                    return (
                      <>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                              const maxId = currentCertificates.length > 0 ? Math.max(...currentCertificates.map(c => c.id)) : 0;
                              const newCertificates = [
                                ...currentCertificates,
                                {
                                  id: maxId + 1,
                                  titleBengali: '',
                                  titleEnglish: '',
                                  imageUrl: '',
                                  description: ''
                                },
                                {
                                  id: maxId + 2,
                                  titleBengali: '',
                                  titleEnglish: '',
                                  imageUrl: ''
                                }
                              ];
                              updateContent(['certificates', 'certificates'], newCertificates);
                            }}
                            className="w-full bg-red-600 text-white hover:bg-red-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Certificate Pair (2 Certificates)
                          </Button>

                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => {
                              if (currentCertificates.length === 0) return;
                              if (!confirm('Are you sure you want to delete the last certificate pair?')) return;
                              const removeFromIndex = Math.max(currentCertificates.length - 2, 0);
                              const newCertificates = currentCertificates.slice(0, removeFromIndex);
                              updateContent(['certificates', 'certificates'], newCertificates);
                            }}
                            disabled={currentCertificates.length === 0}
                            className="w-full"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete Last Certificate Pair
                          </Button>
                        </div>

                        {pairs.map((pair, pairIndex) => {
                          const firstIndex = pairIndex * 2;
                          const secondIndex = firstIndex + 1;
                          return (
                            <Card key={pairIndex} className="p-4 border-2 border-purple-200">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                                  <h4 className="text-sm font-bold text-purple-700">Certificate Pair {pairIndex + 1}</h4>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    type="button"
                                    onClick={() => {
                                      if (pair.length === 0) {
                                        return;
                                      }
                                      if (!confirm(`Are you sure you want to delete Certificate Pair ${pairIndex + 1}? This will remove both certificates in this pair. This action cannot be undone.`)) {
                                        return;
                                      }
                                      const newCertificates = [...currentCertificates];
                                      newCertificates.splice(firstIndex, pair.length);
                                      updateContent(['certificates', 'certificates'], newCertificates);
                                    }}
                                    disabled={pair.length === 0}
                                    className="h-8 w-8 bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={`Delete Certificate Pair ${pairIndex + 1}`}
                                    title={`Delete Certificate Pair ${pairIndex + 1}`}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                {/* Description for the Pair */}
                                <div>
                                  <label className="text-xs text-gray-600 mb-1 block font-semibold">Description (for both certificates in this pair)</label>
                                  <CustomEditor
                                    value={pair[0]?.description || ''}
                                    onChange={(data) => {
                                      const newCertificates = [...currentCertificates];
                                      if (newCertificates[firstIndex]) {
                                        newCertificates[firstIndex] = { ...newCertificates[firstIndex], description: data };
                                        updateContent(['certificates', 'certificates'], newCertificates);
                                      }
                                    }}
                                    placeholder="Enter description that applies to both certificates in this pair"
                                  />
                                </div>
                                
                                {/* Left Certificate (First in Pair) */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="mb-3 flex items-center justify-between">
                                    <h5 className="text-xs font-semibold text-gray-700">Left Certificate</h5>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      type="button"
                                      onClick={() => {
                                        const leftCertificateId = pair[0]?.id;
                                        if (typeof leftCertificateId !== 'number') return;
                                        if (!confirm('Are you sure you want to delete this certificate?')) return;
                                        const newCertificates = currentCertificates.filter(
                                          (certificate) => certificate.id !== leftCertificateId
                                        );
                                        updateContent(['certificates', 'certificates'], newCertificates);
                                      }}
                                      className="h-7 px-2 text-xs bg-red-600 text-white hover:bg-red-700"
                                    >
                                      <Trash className="mr-1 h-3.5 w-3.5" />
                                      Delete
                                    </Button>
                                  </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AttractiveInput
                                        value={pair[0]?.titleEnglish || ''}
                              onChange={(e) => {
                                const newCertificates = [...currentCertificates];
                                          if (newCertificates[firstIndex]) {
                                            newCertificates[firstIndex] = { ...newCertificates[firstIndex], titleEnglish: e.target.value };
                                updateContent(['certificates', 'certificates'], newCertificates);
                                          }
                              }}
                              placeholder="Certificate title (English)"
                              className="mb-2"
                            />
                            <AttractiveInput
                                        value={pair[0]?.titleBengali || ''}
                              onChange={(e) => {
                                const newCertificates = [...currentCertificates];
                                          if (newCertificates[firstIndex]) {
                                            newCertificates[firstIndex] = { ...newCertificates[firstIndex], titleBengali: e.target.value };
                                updateContent(['certificates', 'certificates'], newCertificates);
                                          }
                              }}
                              placeholder="Certificate title (Bengali)"
                              className="mb-2"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Image URL</label>
                            <Input
                              type="url"
                                        value={pair[0]?.imageUrl || ''}
                              onChange={(e) => {
                                const newCertificates = [...currentCertificates];
                                          if (newCertificates[firstIndex]) {
                                            newCertificates[firstIndex] = { ...newCertificates[firstIndex], imageUrl: e.target.value };
                                updateContent(['certificates', 'certificates'], newCertificates);
                                          }
                              }}
                                        placeholder="https://example.com/certificate-image-1.jpg"
                              className="w-full"
                            />
                          </div>
                                  </div>
                                </div>
                                
                                {/* Right Certificate (Second in Pair) */}
                                {pair[1] && (
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="mb-3 flex items-center justify-between">
                                      <h5 className="text-xs font-semibold text-gray-700">Right Certificate</h5>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        type="button"
                                        onClick={() => {
                                          const rightCertificateId = pair[1]?.id;
                                          if (typeof rightCertificateId !== 'number') return;
                                          if (!confirm('Are you sure you want to delete this certificate?')) return;
                                          const newCertificates = currentCertificates.filter(
                                            (certificate) => certificate.id !== rightCertificateId
                                          );
                                          updateContent(['certificates', 'certificates'], newCertificates);
                                        }}
                                        className="h-7 px-2 text-xs bg-red-600 text-white hover:bg-red-700"
                                      >
                                        <Trash className="mr-1 h-3.5 w-3.5" />
                                        Delete
                                      </Button>
                                    </div>
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <AttractiveInput
                                          value={pair[1].titleEnglish}
                                          onChange={(e) => {
                                            const newCertificates = [...currentCertificates];
                                            if (newCertificates[secondIndex]) {
                                              newCertificates[secondIndex] = { ...newCertificates[secondIndex], titleEnglish: e.target.value };
                                              updateContent(['certificates', 'certificates'], newCertificates);
                                            }
                                          }}
                                          placeholder="Certificate title (English)"
                                          className="mb-2"
                                        />
                                        <AttractiveInput
                                          value={pair[1].titleBengali}
                                          onChange={(e) => {
                                            const newCertificates = [...currentCertificates];
                                            if (newCertificates[secondIndex]) {
                                              newCertificates[secondIndex] = { ...newCertificates[secondIndex], titleBengali: e.target.value };
                                              updateContent(['certificates', 'certificates'], newCertificates);
                                            }
                                          }}
                                          placeholder="Certificate title (Bengali)"
                                          className="mb-2"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Image URL</label>
                                        <Input
                                          type="url"
                                          value={pair[1].imageUrl}
                                          onChange={(e) => {
                                            const newCertificates = [...currentCertificates];
                                            if (newCertificates[secondIndex]) {
                                              newCertificates[secondIndex] = { ...newCertificates[secondIndex], imageUrl: e.target.value };
                                              updateContent(['certificates', 'certificates'], newCertificates);
                                            }
                                          }}
                                          placeholder="https://example.com/certificate-image-2.jpg"
                                          className="w-full"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                        </div>
                      </Card>
                    );
                  })}
                        
                  {Array.isArray(content.certificates?.certificates) && content.certificates.certificates.length === 0 && (
                    <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                            No certificates found. Click "Add Certificate Pair" to create certificates.
                    </div>
                  )}
                        
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* About the Institution Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  About the Institution
                </CardTitle>
                <CardDescription>Configure the "About the Institution" section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Title</label>
                  <AttractiveInput
                    value={content.certificates?.about?.title || ''}
                    onChange={(e) => updateContent(['certificates', 'about', 'title'], e.target.value)}
                    placeholder="About the Institution title"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Description</label>
                  <div className="space-y-2">
                    {(content.certificates?.about?.description && content.certificates.about.description.length > 0 
                      ? content.certificates.about.description 
                      : defaultCertificatesContent.about.description).map((paragraph, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1">
                          <CustomEditor
                          value={paragraph}
                          onChange={(data) => {
                            const newDescription = [...(content.certificates?.about?.description || defaultCertificatesContent.about.description)];
                            newDescription[index] = data;
                            updateContent(['certificates', 'about', 'description'], newDescription);
                          }}
                          placeholder={`Paragraph ${index + 1}`}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDescription = (content.certificates?.about?.description || defaultCertificatesContent.about.description).filter((_, i) => i !== index);
                            updateContent(['certificates', 'about', 'description'], newDescription.length > 0 ? newDescription : defaultCertificatesContent.about.description);
                          }}
                          className="text-red-600 hover:text-red-700 mt-2"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentDescription = content.certificates?.about?.description || defaultCertificatesContent.about.description;
                        updateContent(['certificates', 'about', 'description'], [...currentDescription, '']);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Paragraph
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Image URL</label>
                  <Input
                    type="url"
                    value={content.certificates?.about?.imageUrl || ''}
                    onChange={(e) => updateContent(['certificates', 'about', 'imageUrl'], e.target.value)}
                    placeholder="https://example.com/institution-image.jpg"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Team Name</label>
                  <AttractiveInput
                    value={content.certificates?.about?.name || ''}
                    onChange={(e) => updateContent(['certificates', 'about', 'name'], e.target.value)}
                    placeholder="Team or Director name"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block">Affiliation</label>
                  <AttractiveInput
                    value={content.certificates?.about?.affiliation || ''}
                    onChange={(e) => updateContent(['certificates', 'about', 'affiliation'], e.target.value)}
                    placeholder="Team affiliation or role"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photo Gallery Section */}
        {activeTab === 'photoGallery' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo Gallery Section Settings
              </CardTitle>
              <CardDescription>Configure the photo gallery section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.photoGallery?.label?.text || ''}
                    onChange={(e) => updateContent(['photoGallery', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.photoGallery?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['photoGallery', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.photoGallery?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['photoGallery', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.photoGallery?.title?.[part as keyof typeof content.photoGallery.title] || ''}
                        onChange={(e) => updateContent(['photoGallery', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        {part === 'part2' && (
                          <button
                            onClick={() => updateContent(['photoGallery', 'titleColors', part], content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] === 'gradient' ? '#10B981' : 'gradient')}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] === 'gradient'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] === 'gradient' ? '✓ Gradient' : 'Use Gradient'}
                          </button>
                        )}
                        <input
                          type="color"
                          value={content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] === 'gradient' ? '#10B981' : content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            updateContent(['photoGallery', 'titleColors', part], e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                          disabled={part === 'part2' && content.photoGallery?.titleColors?.part2 === 'gradient'}
                        />
                        <Input
                          type="text"
                          value={content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] === 'gradient' ? '#10B981' : content.photoGallery?.titleColors?.[part as keyof typeof content.photoGallery.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            if (part === 'part2' && e.target.value === 'gradient') {
                              updateContent(['photoGallery', 'titleColors', part], 'gradient');
                            } else {
                              updateContent(['photoGallery', 'titleColors', part], e.target.value);
                            }
                          }}
                          placeholder={part === 'part1' ? '#1E3A8A' : '#10B981'}
                          className="flex-1 text-xs"
                          disabled={part === 'part2' && content.photoGallery?.titleColors?.part2 === 'gradient'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Colors (if part2 is gradient) */}
              {content.photoGallery?.titleColors?.part2 === 'gradient' && (
                <Card className="p-4 bg-purple-50">
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Gradient Colors</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">From</label>
                          <input
                            type="color"
                            value={content.photoGallery?.gradientColors?.from || '#A855F7'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'from'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.photoGallery?.gradientColors?.from || '#A855F7'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'from'], e.target.value)}
                            placeholder="#A855F7"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Via (Optional)</label>
                          <input
                            type="color"
                            value={content.photoGallery?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'via'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.photoGallery?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'via'], e.target.value)}
                            placeholder="#14B8A6"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">To</label>
                          <input
                            type="color"
                            value={content.photoGallery?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'to'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.photoGallery?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['photoGallery', 'gradientColors', 'to'], e.target.value)}
                            placeholder="#10B981"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div className="text-2xl font-bold">
                          <span style={{ color: content.photoGallery?.titleColors?.part1 || '#1E3A8A' }}>
                            {content.photoGallery?.title?.part1 || 'আসুন দেখি আমাদের'}
                          </span>{" "}
                          <span
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: content.photoGallery?.gradientColors?.via
                                ? `linear-gradient(to right, ${content.photoGallery.gradientColors.from || '#A855F7'}, ${content.photoGallery.gradientColors.via}, ${content.photoGallery.gradientColors.to || '#10B981'})`
                                : `linear-gradient(to right, ${content.photoGallery?.gradientColors?.from || '#A855F7'}, ${content.photoGallery?.gradientColors?.to || '#10B981'})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {content.photoGallery?.title?.part2 || 'ফটো গ্যালারি'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This is how your gradient will appear on the title
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gallery Images */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Gallery Images</label>
                {(content.photoGallery?.images && content.photoGallery.images.length > 0 ? content.photoGallery.images : defaultPhotoGalleryContent.images).map((image, index) => {
                  const currentImages = content.photoGallery?.images && content.photoGallery.images.length > 0 
                    ? content.photoGallery.images 
                    : defaultPhotoGalleryContent.images;
                    return (
                      <Card key={image.id || index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                              Certificate {index + 1}
                            </span>
                          </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Image {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete this image"
                            onClick={() => {
                              const newImages = currentImages.filter((_, i) => i !== index);
                              updateContent(['photoGallery', 'images'], newImages.length > 0 ? newImages : defaultPhotoGalleryContent.images);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Image URL</label>
                            <Input
                              type="url"
                              value={image.image}
                              onChange={(e) => {
                                const newImages = [...currentImages];
                                newImages[index] = { ...newImages[index], image: e.target.value };
                                updateContent(['photoGallery', 'images'], newImages);
                              }}
                              placeholder="https://example.com/image.jpg"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Alt Text</label>
                            <Input
                              type="text"
                              value={image.alt}
                              onChange={(e) => {
                                const newImages = [...currentImages];
                                newImages[index] = { ...newImages[index], alt: e.target.value };
                                updateContent(['photoGallery', 'images'], newImages);
                              }}
                              placeholder="Image description"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newImages = [...currentImages];
                              updateContent(['photoGallery', 'images'], newImages);
                            }}
                          >
                            Update Image
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newImages = currentImages.filter((_, i) => i !== index);
                              updateContent(['photoGallery', 'images'], newImages.length > 0 ? newImages : defaultPhotoGalleryContent.images);
                            }}
                          >
                            Delete Image
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.photoGallery?.images || content.photoGallery.images.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default images. Click "Add Image" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentImages = content.photoGallery?.images && content.photoGallery.images.length > 0 
                      ? content.photoGallery.images 
                      : defaultPhotoGalleryContent.images;
                    const maxId = currentImages.length > 0 ? Math.max(...currentImages.map(img => img.id)) : 0;
                    const newImages = [...currentImages, { 
                      id: maxId + 1, 
                      image: '',
                      alt: ''
                    }];
                    updateContent(['photoGallery', 'images'], newImages);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blog Section */}
        {activeTab === 'blog' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Blog Section Settings
              </CardTitle>
              <CardDescription>Configure the blog section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.blog?.label?.text || ''}
                    onChange={(e) => updateContent(['blog', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.blog?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['blog', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.blog?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['blog', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2', 'part3', 'part4'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.blog?.title?.[part as keyof typeof content.blog.title] || ''}
                        onChange={(e) => updateContent(['blog', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        {part === 'part4' && (
                          <button
                            onClick={() => updateContent(['blog', 'titleColors', part], content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] === 'gradient' ? '#10B981' : 'gradient')}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] === 'gradient'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] === 'gradient' ? '✓ Gradient' : 'Use Gradient'}
                          </button>
                        )}
                        <input
                          type="color"
                          value={content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] === 'gradient' ? '#10B981' : content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            updateContent(['blog', 'titleColors', part], e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                          disabled={part === 'part4' && content.blog?.titleColors?.part4 === 'gradient'}
                        />
                        <Input
                          type="text"
                          value={content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] === 'gradient' ? '#10B981' : content.blog?.titleColors?.[part as keyof typeof content.blog.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            if (part === 'part4' && e.target.value === 'gradient') {
                              updateContent(['blog', 'titleColors', part], 'gradient');
                            } else {
                              updateContent(['blog', 'titleColors', part], e.target.value);
                            }
                          }}
                          placeholder={part === 'part1' || part === 'part2' || part === 'part3' ? '#1E3A8A' : '#10B981'}
                          className="flex-1 text-xs"
                          disabled={part === 'part4' && content.blog?.titleColors?.part4 === 'gradient'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Colors (if part4 is gradient) */}
              {content.blog?.titleColors?.part4 === 'gradient' && (
                <Card className="p-4 bg-purple-50">
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">Gradient Colors</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">From</label>
                          <input
                            type="color"
                            value={content.blog?.gradientColors?.from || '#EC4899'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'from'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.blog?.gradientColors?.from || '#EC4899'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'from'], e.target.value)}
                            placeholder="#EC4899"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Via (Optional)</label>
                          <input
                            type="color"
                            value={content.blog?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'via'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.blog?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'via'], e.target.value)}
                            placeholder="#14B8A6"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">To</label>
                          <input
                            type="color"
                            value={content.blog?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'to'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.blog?.gradientColors?.to || '#10B981'}
                            onChange={(e) => updateContent(['blog', 'gradientColors', 'to'], e.target.value)}
                            placeholder="#10B981"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">Preview:</p>
                        <div className="text-2xl font-bold">
                          <span style={{ color: content.blog?.titleColors?.part1 || '#1E3A8A' }}>
                            {content.blog?.title?.part1 || 'আমাদের সর্বশেষ'}
                          </span>{" "}
                          <span style={{ color: content.blog?.titleColors?.part2 || '#1E3A8A' }}>
                            {content.blog?.title?.part2 || 'খবর'}
                          </span>{" "}
                          <span style={{ color: content.blog?.titleColors?.part3 || '#1E3A8A' }}>
                            {content.blog?.title?.part3 || 'এবং'}
                          </span>{" "}
                          <span
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: content.blog?.gradientColors?.via
                                ? `linear-gradient(to right, ${content.blog.gradientColors.from || '#EC4899'}, ${content.blog.gradientColors.via}, ${content.blog.gradientColors.to || '#10B981'})`
                                : `linear-gradient(to right, ${content.blog?.gradientColors?.from || '#EC4899'}, ${content.blog?.gradientColors?.to || '#10B981'})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {content.blog?.title?.part4 || 'ব্লগ'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          This is how your gradient will appear on the title
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Button Text */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Button Text</label>
                <AttractiveInput
                  value={content.blog?.buttonText || ''}
                  onChange={(e) => updateContent(['blog', 'buttonText'], e.target.value)}
                  placeholder="Button text"
                />
              </div>

              {/* Blog Posts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Blog Posts</label>
                {(content.blog?.posts && content.blog.posts.length > 0 ? content.blog.posts : defaultBlogContent.posts).map((post, index) => {
                  const currentPosts = content.blog?.posts && content.blog.posts.length > 0 
                    ? content.blog.posts 
                    : defaultBlogContent.posts;
                  return (
                    <Card key={post.id || index} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Post {index + 1}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateContent(['blog', 'posts'], [...currentPosts]);
                              }}
                            >
                              Update Post
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete this post"
                              onClick={() => {
                                const newPosts = currentPosts.filter((_, i) => i !== index);
                                updateContent(['blog', 'posts'], newPosts.length > 0 ? newPosts : defaultBlogContent.posts);
                              }}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Image URL</label>
                            <Input
                              type="url"
                              value={post.image}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], image: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="https://example.com/blog-image.jpg"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Date</label>
                            <Input
                              type="text"
                              value={post.date}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], date: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="Aug 20, 2025"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Author (English)</label>
                            <Input
                              type="text"
                              value={post.author}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], author: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="Author name"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Author (Bengali)</label>
                            <Input
                              type="text"
                              value={post.authorBengali}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], authorBengali: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="লেখকের নাম"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Comments (English)</label>
                            <Input
                              type="text"
                              value={post.comments}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], comments: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="2.5k"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">Comments (Bengali)</label>
                            <Input
                              type="text"
                              value={post.commentsBengali}
                              onChange={(e) => {
                                const newPosts = [...currentPosts];
                                newPosts[index] = { ...newPosts[index], commentsBengali: e.target.value };
                                updateContent(['blog', 'posts'], newPosts);
                              }}
                              placeholder="2.5k মন্তব্য"
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Title (English)</label>
                          <Input
                            type="text"
                            value={post.title}
                            onChange={(e) => {
                              const newPosts = [...currentPosts];
                              newPosts[index] = { ...newPosts[index], title: e.target.value };
                              updateContent(['blog', 'posts'], newPosts);
                            }}
                            placeholder="Blog post title"
                            className="w-full mb-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Title (Bengali)</label>
                          <Input
                            type="text"
                            value={post.titleBengali}
                            onChange={(e) => {
                              const newPosts = [...currentPosts];
                              newPosts[index] = { ...newPosts[index], titleBengali: e.target.value };
                              updateContent(['blog', 'posts'], newPosts);
                            }}
                            placeholder="ব্লগ পোস্ট শিরোনাম"
                            className="w-full mb-2"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Description (English)</label>
                          <CustomEditor
                            value={post.description}
                            onChange={(data) => {
                              const newPosts = [...currentPosts];
                              newPosts[index] = { ...newPosts[index], description: data };
                              updateContent(['blog', 'posts'], newPosts);
                            }}
                            placeholder="Blog post description"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Description (Bengali)</label>
                          <CustomEditor
                            value={post.descriptionBengali}
                            onChange={(data) => {
                              const newPosts = [...currentPosts];
                              newPosts[index] = { ...newPosts[index], descriptionBengali: data };
                              updateContent(['blog', 'posts'], newPosts);
                            }}
                            placeholder="ব্লগ পোস্ট বর্ণনা"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
                {(!content.blog?.posts || content.blog.posts.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    Showing default posts. Click "Add Post" to add more or edit existing ones.
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentPosts = content.blog?.posts && content.blog.posts.length > 0 
                      ? content.blog.posts 
                      : defaultBlogContent.posts;
                    const maxId = currentPosts.length > 0 ? Math.max(...currentPosts.map(p => p.id)) : 0;
                    const newPosts = [...currentPosts, { 
                      id: maxId + 1, 
                      image: '',
                      date: '',
                      author: '',
                      authorBengali: '',
                      comments: '',
                      commentsBengali: '',
                      title: '',
                      titleBengali: '',
                      description: '',
                      descriptionBengali: ''
                    }];
                    updateContent(['blog', 'posts'], newPosts);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        {activeTab === 'faq' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                FAQ সেকশন সেটিংস
              </CardTitle>
              <CardDescription>কোর্স বিবরণ পৃষ্ঠার জন্য FAQ সেকশন কনটেন্ট কনফিগার করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">লেবেল</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.faq?.label?.text || ''}
                    onChange={(e) => updateContent(['faq', 'label', 'text'], e.target.value)}
                    placeholder="লেবেল টেক্সট"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">ব্যাকগ্রাউন্ড রঙ</label>
                    <input
                      type="color"
                      value={content.faq?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['faq', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.faq?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['faq', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">শিরোনাম অংশ</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.faq?.title?.[part as keyof typeof content.faq.title] || ''}
                        onChange={(e) => updateContent(['faq', 'title', part], e.target.value)}
                        placeholder={`শিরোনাম ${part === 'part1' ? '১' : '২'}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        {part === 'part2' && (
                          <button
                            onClick={() => updateContent(['faq', 'titleColors', part], content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] === 'gradient' ? '#10B981' : 'gradient')}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                              content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] === 'gradient'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] === 'gradient' ? '✓ গ্রেডিয়েন্ট' : 'গ্রেডিয়েন্ট ব্যবহার করুন'}
                          </button>
                        )}
                        <input
                          type="color"
                          value={content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] === 'gradient' ? '#10B981' : content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            updateContent(['faq', 'titleColors', part], e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                          disabled={part === 'part2' && content.faq?.titleColors?.part2 === 'gradient'}
                        />
                        <Input
                          type="text"
                          value={content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] === 'gradient' ? '#10B981' : content.faq?.titleColors?.[part as keyof typeof content.faq.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            if (part === 'part2' && e.target.value === 'gradient') {
                              updateContent(['faq', 'titleColors', part], 'gradient');
                            } else {
                              updateContent(['faq', 'titleColors', part], e.target.value);
                            }
                          }}
                          placeholder={part === 'part1' ? '#1E3A8A' : '#10B981'}
                          className="flex-1 text-xs"
                          disabled={part === 'part2' && content.faq?.titleColors?.part2 === 'gradient'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Colors (if part2 is gradient) */}
              {content.faq?.titleColors?.part2 === 'gradient' && (
                <Card className="p-4 bg-purple-50">
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-2 block">গ্রেডিয়েন্ট রঙ</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">থেকে</label>
                          <input
                            type="color"
                            value={content.faq?.gradientColors?.from || '#10B981'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'from'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.faq?.gradientColors?.from || '#10B981'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'from'], e.target.value)}
                            placeholder="#10B981"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Via (Optional)</label>
                          <input
                            type="color"
                            value={content.faq?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'via'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.faq?.gradientColors?.via || '#14B8A6'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'via'], e.target.value)}
                            placeholder="#14B8A6"
                            className="flex-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">To</label>
                          <input
                            type="color"
                            value={content.faq?.gradientColors?.to || '#A855F7'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'to'], e.target.value)}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={content.faq?.gradientColors?.to || '#A855F7'}
                            onChange={(e) => updateContent(['faq', 'gradientColors', 'to'], e.target.value)}
                            placeholder="#A855F7"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-4 p-4 bg-white rounded-lg border">
                        <p className="text-xs text-gray-600 mb-2">পূর্বরূপ:</p>
                        <div className="text-2xl font-bold">
                          <span style={{ color: content.faq?.titleColors?.part1 || '#1E3A8A' }}>
                            {content.faq?.title?.part1 || 'সচরাচর'}
                          </span>{" "}
                          <span
                            className="bg-clip-text text-transparent"
                            style={{
                              backgroundImage: content.faq?.gradientColors?.via
                                ? `linear-gradient(to right, ${content.faq.gradientColors.from || '#10B981'}, ${content.faq.gradientColors.via}, ${content.faq.gradientColors.to || '#A855F7'})`
                                : `linear-gradient(to right, ${content.faq?.gradientColors?.from || '#10B981'}, ${content.faq?.gradientColors?.to || '#A855F7'})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            {content.faq?.title?.part2 || 'জিজ্ঞাসিত প্রশ্ন'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          এটি আপনার গ্রেডিয়েন্ট শিরোনামে কীভাবে প্রদর্শিত হবে
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* FAQ Items */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">FAQ আইটেম</label>
                {(content.faq?.faqs && content.faq.faqs.length > 0 ? content.faq.faqs : defaultFAQContent.faqs)
                  .sort((a, b) => a.order - b.order)
                  .map((faq, index) => {
                    const currentFAQs = content.faq?.faqs && content.faq.faqs.length > 0 
                      ? content.faq.faqs 
                      : defaultFAQContent.faqs;
                    return (
                      <Card key={faq.id || index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">FAQ {index + 1}</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateContent(['faq', 'faqs'], [...currentFAQs]);
                                }}
                              >
                                আপডেট FAQ
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newFAQs = currentFAQs.filter((_, i) => i !== index);
                                  updateContent(['faq', 'faqs'], newFAQs.length > 0 ? newFAQs : defaultFAQContent.faqs);
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                FAQ মুছুন
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">প্রশ্ন</label>
                            <Input
                              type="text"
                              value={faq.question}
                              onChange={(e) => {
                                const newFAQs = [...currentFAQs];
                                newFAQs[index] = { ...newFAQs[index], question: e.target.value };
                                updateContent(['faq', 'faqs'], newFAQs);
                              }}
                              placeholder="প্রশ্ন লিখুন"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">উত্তর</label>
                            <textarea
                              value={faq.answer}
                              onChange={(e) => {
                                const newFAQs = [...currentFAQs];
                                newFAQs[index] = { ...newFAQs[index], answer: e.target.value };
                                updateContent(['faq', 'faqs'], newFAQs);
                              }}
                              placeholder="উত্তর লিখুন"
                              rows={4}
                              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 mb-1 block">ক্রম</label>
                            <Input
                              type="number"
                              value={faq.order}
                              onChange={(e) => {
                                const newFAQs = [...currentFAQs];
                                newFAQs[index] = { ...newFAQs[index], order: parseInt(e.target.value) || 0 };
                                updateContent(['faq', 'faqs'], newFAQs);
                              }}
                              placeholder="প্রদর্শনের ক্রম"
                              className="w-full"
                              min="1"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                {(!content.faq?.faqs || content.faq.faqs.length === 0) && (
                  <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg text-center">
                    ডিফল্ট FAQ দেখানো হচ্ছে। আরও যোগ করতে বা বিদ্যমানগুলি সম্পাদনা করতে "FAQ যোগ করুন" ক্লিক করুন।
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentFAQs = content.faq?.faqs && content.faq.faqs.length > 0 
                      ? content.faq.faqs 
                      : defaultFAQContent.faqs;
                    const maxId = currentFAQs.length > 0 ? Math.max(...currentFAQs.map(f => f.id)) : 0;
                    const maxOrder = currentFAQs.length > 0 ? Math.max(...currentFAQs.map(f => f.order)) : 0;
                    const newFAQs = [...currentFAQs, { 
                      id: maxId + 1, 
                      question: '',
                      answer: '',
                      order: maxOrder + 1
                    }];
                    updateContent(['faq', 'faqs'], newFAQs);
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  FAQ যোগ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Management Section */}
        {activeTab === 'reviews' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews Management
              </CardTitle>
            <CardDescription>Select which reviews to display on course details pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowAddReviewModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews by student name, course, title, or comment..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {reviewSearch && (
                  <button
                    onClick={() => setReviewSearch('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {reviewSearch ? 'No reviews found matching your search.' : 'No reviews found.'}
                  </p>
                  {!reviewSearch && (
                    <p className="text-sm">Reviews will appear here once students submit them.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-gray-600 mb-4">
                    Showing {filteredReviews.length} of {reviews.length} reviews
                  </div>
                  
                  {/* Displayed Reviews - Draggable */}
                  {displayedReviews.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Displayed Reviews ({displayedReviews.length})
                        </h3>
                        <p className="text-xs text-gray-500">Drag and drop to reorder</p>
                      </div>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => {
                          const { active, over } = event;
                          if (over && active.id !== over.id) {
                            const oldIndex = displayedReviews.findIndex(r => r._id === active.id);
                            const newIndex = displayedReviews.findIndex(r => r._id === over.id);
                            
                            if (oldIndex !== -1 && newIndex !== -1) {
                              const reorderedDisplayed = arrayMove(displayedReviews, oldIndex, newIndex);
                              const updatedDisplayed = reorderedDisplayed.map((review, index) => ({
                                ...review,
                                displayOrder: index + 1
                              }));
                              
                              updateReviewOrder(updatedDisplayed);
                            }
                          }
                        }}
                      >
                        <SortableContext
                          items={displayedReviews.map(r => r._id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {displayedReviews.map((review) => (
                              <SortableReviewItem
                                key={review._id}
                                review={review}
                                onToggleDisplay={toggleReviewDisplay}
                                onView={(review) => {
                                  setSelectedReview(review);
                                  setShowReviewModal(true);
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )}

                  {/* Hidden Reviews - Not Draggable */}
                  {hiddenReviews.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pt-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-gray-400" />
                          Hidden Reviews ({hiddenReviews.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {hiddenReviews.map((review) => (
                          <div
                            key={review._id}
                            className="rounded-lg border-2 p-4 transition-all border-gray-200 bg-white hover:border-gray-300"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {getReviewStudentLabel(review)}
                                  </span>
                                  {review.isApproved && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Approved
                                    </Badge>
                                  )}
                                  {review.isPublic && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Public
                                    </Badge>
                                  )}
                                  {review.reviewType === 'video' && (
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      <Play className="w-3 h-3 mr-1" />
                                      Video
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Course: {typeof review.course === 'object' ? review.course?.title || 'Unknown' : 'Unknown'}
                                </div>
                                {review.title && (
                                  <h4 className="text-sm font-semibold text-gray-800 mb-1">{review.title}</h4>
                                )}
                                {review.comment && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{review.comment}</p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowReviewModal(true);
                                  }}
                                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <div className="flex flex-col items-center gap-2">
                                  <Checkbox
                                    checked={review.isDisplayed || false}
                                    onCheckedChange={() => toggleReviewDisplay(review._id, review.isDisplayed || false)}
                                    className="h-5 w-5"
                                  />
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    Hidden
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Review Modal */}
        <Dialog
          open={showAddReviewModal}
          onOpenChange={(open) => {
            setShowAddReviewModal(open);
            if (!open) resetNewReviewForm();
          }}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Review
              </DialogTitle>
              <DialogDescription>
                Create a review as admin. Student name is optional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Course</label>
                  <select
                    value={newReview.course}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, course: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20 focus:border-[#7B2CBF]"
                  >
                    <option value="">Select course</option>
                    {reviewCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20 focus:border-[#7B2CBF]"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} Star
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Review Type</label>
                  <select
                    value={newReview.reviewType}
                    onChange={(e) =>
                      setNewReview((prev) => ({
                        ...prev,
                        reviewType: e.target.value as 'text' | 'video',
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20 focus:border-[#7B2CBF]"
                  >
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
                  <Input
                    value={newReview.title}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Optional title"
                  />
                </div>
              </div>

              {newReview.reviewType === 'text' ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Comment</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview((prev) => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    placeholder="Write review comment"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20 focus:border-[#7B2CBF]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Video URL</label>
                    <Input
                      value={newReview.videoUrl}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Video Thumbnail URL</label>
                    <Input
                      value={newReview.videoThumbnail}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, videoThumbnail: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={newReview.isPublic}
                    onCheckedChange={(checked) =>
                      setNewReview((prev) => ({ ...prev, isPublic: Boolean(checked) }))
                    }
                  />
                  Public
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={newReview.isApproved}
                    onCheckedChange={(checked) =>
                      setNewReview((prev) => ({ ...prev, isApproved: Boolean(checked) }))
                    }
                  />
                  Approved
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={newReview.isDisplayed}
                    onCheckedChange={(checked) =>
                      setNewReview((prev) => ({ ...prev, isDisplayed: Boolean(checked) }))
                    }
                  />
                  Display on website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddReviewModal(false);
                    resetNewReviewForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReview}
                  disabled={creatingReview}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {creatingReview ? 'Adding...' : 'Add Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review View Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Review Details
              </DialogTitle>
              <DialogDescription>
                View complete review information
              </DialogDescription>
            </DialogHeader>
            
            {selectedReview && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  {selectedReview.student?.avatar && (
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200">
                      <Image
                        src={selectedReview.student.avatar}
                        alt={getReviewStudentLabel(selectedReview)}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getReviewStudentLabel(selectedReview)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {typeof selectedReview.course === 'object' 
                        ? selectedReview.course?.title || 'Unknown Course'
                        : 'Unknown Course'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < selectedReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {selectedReview.isApproved && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  )}
                  {selectedReview.isPublic && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Public
                    </Badge>
                  )}
                  {selectedReview.isDisplayed && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      Displayed
                    </Badge>
                  )}
                  {selectedReview.reviewType === 'video' && (
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      <Play className="w-3 h-3 mr-1" />
                      Video Review
                    </Badge>
                  )}
                  {selectedReview.isVerified && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      Verified Student
                    </Badge>
                  )}
                </div>

                {/* Review Title */}
                {selectedReview.title && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Review Title</h4>
                    <p className="text-gray-700">{selectedReview.title}</p>
                  </div>
                )}

                {/* Text Review Comment */}
                {selectedReview.reviewType === 'text' && selectedReview.comment && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Review Comment</h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedReview.comment}
                    </p>
                  </div>
                )}

                {/* Video Review */}
                {selectedReview.reviewType === 'video' && selectedReview.videoUrl && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2">Video Review</h4>
                    {selectedReview.videoThumbnail && (
                      <div className="mb-3">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Video Thumbnail URL</h5>
                        <a
                          href={selectedReview.videoThumbnail}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {selectedReview.videoThumbnail}
                        </a>
                      </div>
                    )}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
                      <video
                        src={selectedReview.videoUrl}
                        controls
                        className="h-full w-full object-contain"
                        preload="metadata"
                        playsInline
                        poster={selectedReview.videoThumbnail}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <VideoWatermark />
                    </div>
                    {selectedReview.comment && (
                      <div className="mt-3">
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Additional Comment</h5>
                        <p className="text-gray-600 whitespace-pre-wrap text-sm">
                          {selectedReview.comment}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Helpful Votes</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedReview.helpfulVotes || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reported Count</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedReview.reportedCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedReview.updatedAt || selectedReview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Display Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Display Status</p>
                    <p className="text-xs text-gray-500">
                      {selectedReview.isDisplayed 
                        ? 'This review is currently displayed on course details pages'
                        : 'This review is hidden from course details pages'}
                    </p>
                  </div>
                  <Checkbox
                    checked={selectedReview.isDisplayed || false}
                    onCheckedChange={() => {
                      toggleReviewDisplay(selectedReview._id, selectedReview.isDisplayed || false);
                      // Update the selected review state
                      setSelectedReview({
                        ...selectedReview,
                        isDisplayed: !(selectedReview.isDisplayed || false)
                      });
                    }}
                    className="h-5 w-5"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Courses Section */}
        {activeTab === 'courses' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Courses Section Settings
              </CardTitle>
              <CardDescription>Configure the courses section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.courses?.label?.text || ''}
                    onChange={(e) => updateContent(['courses', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.courses?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['courses', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.courses?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['courses', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <AttractiveInput
                      value={content.courses?.title?.part1 || ''}
                      onChange={(e) => updateContent(['courses', 'title', 'part1'], e.target.value)}
                      placeholder="Title part 1"
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.courses?.titleColors?.part1 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['courses', 'titleColors', 'part1'], e.target.value);
                        }}
                        className="h-8 w-16 rounded border"
                      />
                      <Input
                        type="text"
                        value={content.courses?.titleColors?.part1 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['courses', 'titleColors', 'part1'], e.target.value);
                        }}
                        placeholder="#1E3A8A"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <AttractiveInput
                      value={content.courses?.title?.part2 || ''}
                      onChange={(e) => updateContent(['courses', 'title', 'part2'], e.target.value)}
                      placeholder="Title part 2 (will use gradient)"
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Gradient Colors</label>
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="color"
                          value={content.courses?.gradientColors?.from || '#10B981'}
                          onChange={(e) => {
                            updateContent(['courses', 'gradientColors', 'from'], e.target.value);
                          }}
                          className="h-8 w-12 rounded border"
                        />
                        <input
                          type="color"
                          value={content.courses?.gradientColors?.via || '#14B8A6'}
                          onChange={(e) => {
                            updateContent(['courses', 'gradientColors', 'via'], e.target.value);
                          }}
                          className="h-8 w-12 rounded border"
                        />
                        <input
                          type="color"
                          value={content.courses?.gradientColors?.to || '#A855F7'}
                          onChange={(e) => {
                            updateContent(['courses', 'gradientColors', 'to'], e.target.value);
                          }}
                          className="h-8 w-12 rounded border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Input
                        type="text"
                        value={content.courses?.gradientColors?.from || '#10B981'}
                        onChange={(e) => {
                          updateContent(['courses', 'gradientColors', 'from'], e.target.value);
                        }}
                        placeholder="#10B981"
                        className="text-xs"
                      />
                      <Input
                        type="text"
                        value={content.courses?.gradientColors?.via || '#14B8A6'}
                        onChange={(e) => {
                          updateContent(['courses', 'gradientColors', 'via'], e.target.value);
                        }}
                        placeholder="#14B8A6"
                        className="text-xs"
                      />
                      <Input
                        type="text"
                        value={content.courses?.gradientColors?.to || '#A855F7'}
                        onChange={(e) => {
                          updateContent(['courses', 'gradientColors', 'to'], e.target.value);
                        }}
                        placeholder="#A855F7"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Button</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.courses?.buttonText || ''}
                    onChange={(e) => updateContent(['courses', 'buttonText'], e.target.value)}
                    placeholder="Button text"
                  />
                  <AttractiveInput
                    value={content.courses?.buttonHref || ''}
                    onChange={(e) => updateContent(['courses', 'buttonHref'], e.target.value)}
                    placeholder="Button URL"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient From</label>
                    <input
                      type="color"
                      value={content.courses?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['courses', 'buttonGradientFrom'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.courses?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['courses', 'buttonGradientFrom'], e.target.value)}
                      placeholder="#EC4899"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient To</label>
                    <input
                      type="color"
                      value={content.courses?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['courses', 'buttonGradientTo'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.courses?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['courses', 'buttonGradientTo'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Courses Order */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold block">Featured Courses (Homepage Card Order)</label>
                  <Badge variant="outline">
                    {(content.courses?.featuredCourseIds ?? []).length}/8
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Add courses and reorder them. Homepage "আমাদের সবচেয়ে জনপ্রিয় কোর্স" cards follow this order.
                </p>

                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-600">Add from published courses</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                    {publishedCoursesList.length === 0 ? (
                      <p className="text-xs text-gray-500">No published courses found.</p>
                    ) : (
                      publishedCoursesList.map((course) => {
                        const isSelected = (content.courses?.featuredCourseIds ?? []).includes(course._id);
                        return (
                          <div key={course._id} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1.5">
                            <span className="truncate text-sm text-gray-700">{course.title}</span>
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? 'outline' : 'default'}
                              disabled={isSelected}
                              onClick={() => addFeaturedCourse(course._id)}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" />
                              {isSelected ? 'Added' : 'Add'}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-600">Selected order</p>
                  {(content.courses?.featuredCourseIds ?? []).length === 0 ? (
                    <p className="text-xs text-gray-500">No featured courses selected. Latest courses will be shown automatically.</p>
                  ) : (
                    <div className="space-y-2">
                      {(content.courses?.featuredCourseIds ?? []).map((courseId, index) => {
                        const matched = publishedCoursesList.find((c) => c._id === courseId);
                        const title = matched?.title || `Unknown course (${courseId})`;
                        return (
                          <div key={courseId} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-2 py-1.5">
                            <div className="min-w-0 flex items-center gap-2">
                              <Badge variant="secondary" className="shrink-0">{index + 1}</Badge>
                              <span className="truncate text-sm text-gray-700">{title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                disabled={index === 0}
                                onClick={() => moveFeaturedCourse(courseId, 'up')}
                              >
                                <LuArrowUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                disabled={index === (content.courses?.featuredCourseIds ?? []).length - 1}
                                onClick={() => moveFeaturedCourse(courseId, 'down')}
                              >
                                <LuArrowDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() => removeFeaturedCourse(courseId)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promotional Banner Section (Student My Courses page) */}
        {activeTab === 'promoBanner' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Promotional Banner
              </CardTitle>
              <CardDescription>Configure the promotional banner shown on the student portal My Courses page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="promoBannerEnabled"
                  checked={content.promotionalBanner?.enabled ?? true}
                  onCheckedChange={(checked) => updateContent(['promotionalBanner', 'enabled'], checked === true)}
                />
                <label htmlFor="promoBannerEnabled" className="text-sm font-medium cursor-pointer">Show promotional banner on My Courses page</label>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Banner image URL (optional)</label>
                <Input
                  value={content.promotionalBanner?.imageUrl ?? ''}
                  onChange={(e) => updateContent(['promotionalBanner', 'imageUrl'], e.target.value)}
                  placeholder="https://example.com/banner.jpg or leave empty for gradient"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Link URL (when banner is clicked)</label>
                <Input
                  value={content.promotionalBanner?.link ?? '/#courses'}
                  onChange={(e) => updateContent(['promotionalBanner', 'link'], e.target.value)}
                  placeholder="/#courses or /all-courses"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Headline</label>
                <AttractiveInput
                  value={content.promotionalBanner?.headline ?? defaultPromoBannerContent.headline}
                  onChange={(e) => updateContent(['promotionalBanner', 'headline'], e.target.value)}
                  placeholder="e.g. আরও কোর্স এক্সপ্লোর করুন"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Subtext</label>
                <AttractiveInput
                  value={content.promotionalBanner?.subtext ?? defaultPromoBannerContent.subtext}
                  onChange={(e) => updateContent(['promotionalBanner', 'subtext'], e.target.value)}
                  placeholder="e.g. নতুন কোর্সে বিশেষ ছাড় পেতে এখনই দেখুন"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">CTA button label</label>
                <Input
                  value={content.promotionalBanner?.ctaLabel ?? defaultPromoBannerContent.ctaLabel}
                  onChange={(e) => updateContent(['promotionalBanner', 'ctaLabel'], e.target.value)}
                  placeholder="e.g. দেখুন"
                  className="w-full max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Lesson Banner Section (Student Course Lesson page) */}
        {activeTab === 'courseLessonBanner' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Course Lesson Banner
              </CardTitle>
              <CardDescription>Configure the image/title banner shown in My Course lesson page above the video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="courseLessonBannerEnabled"
                  checked={content.courseLessonBanner?.enabled ?? true}
                  onCheckedChange={(checked) => updateContent(['courseLessonBanner', 'enabled'], checked === true)}
                />
                <label htmlFor="courseLessonBannerEnabled" className="text-sm font-medium cursor-pointer">Show lesson banner on My Course lesson page</label>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Banner title</label>
                <AttractiveInput
                  value={content.courseLessonBanner?.title ?? defaultCourseLessonBannerContent.title}
                  onChange={(e) => updateContent(['courseLessonBanner', 'title'], e.target.value)}
                  placeholder="e.g. আজকের লেসনে স্বাগতম"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Banner image URL</label>
                <Input
                  value={content.courseLessonBanner?.imageUrl ?? ''}
                  onChange={(e) => updateContent(['courseLessonBanner', 'imageUrl'], e.target.value)}
                  placeholder="https://example.com/lesson-banner.jpg"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses By Category Section */}
        {activeTab === 'coursesByCategory' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Courses By Category Section Settings
              </CardTitle>
              <CardDescription>Configure the courses by category section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.coursesByCategory?.label?.text || ''}
                    onChange={(e) => updateContent(['coursesByCategory', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.coursesByCategory?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['coursesByCategory', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.coursesByCategory?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['coursesByCategory', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <AttractiveInput
                      value={content.coursesByCategory?.title?.part1 || ''}
                      onChange={(e) => updateContent(['coursesByCategory', 'title', 'part1'], e.target.value)}
                      placeholder="Title part 1"
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.coursesByCategory?.titleColors?.part1 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'titleColors', 'part1'], e.target.value);
                        }}
                        className="h-8 w-16 rounded border"
                      />
                      <Input
                        type="text"
                        value={content.coursesByCategory?.titleColors?.part1 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'titleColors', 'part1'], e.target.value);
                        }}
                        placeholder="#1E3A8A"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <AttractiveInput
                      value={content.coursesByCategory?.title?.part2 || ''}
                      onChange={(e) => updateContent(['coursesByCategory', 'title', 'part2'], e.target.value)}
                      placeholder="Title part 2"
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={content.coursesByCategory?.titleColors?.part2 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'titleColors', 'part2'], e.target.value);
                        }}
                        className="h-8 w-16 rounded border"
                      />
                      <Input
                        type="text"
                        value={content.coursesByCategory?.titleColors?.part2 || '#1E3A8A'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'titleColors', 'part2'], e.target.value);
                        }}
                        placeholder="#1E3A8A"
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <AttractiveInput
                      value={content.coursesByCategory?.title?.part3 || ''}
                      onChange={(e) => updateContent(['coursesByCategory', 'title', 'part3'], e.target.value)}
                      placeholder="Title part 3 (will use gradient)"
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Gradient Colors</label>
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="color"
                          value={content.coursesByCategory?.gradientColors?.from || '#A855F7'}
                          onChange={(e) => {
                            updateContent(['coursesByCategory', 'gradientColors', 'from'], e.target.value);
                          }}
                          className="h-8 w-12 rounded border"
                        />
                        <input
                          type="color"
                          value={content.coursesByCategory?.gradientColors?.to || '#10B981'}
                          onChange={(e) => {
                            updateContent(['coursesByCategory', 'gradientColors', 'to'], e.target.value);
                          }}
                          className="h-8 w-12 rounded border"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Input
                        type="text"
                        value={content.coursesByCategory?.gradientColors?.from || '#A855F7'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'gradientColors', 'from'], e.target.value);
                        }}
                        placeholder="#A855F7"
                        className="text-xs"
                      />
                      <Input
                        type="text"
                        value={content.coursesByCategory?.gradientColors?.to || '#10B981'}
                        onChange={(e) => {
                          updateContent(['coursesByCategory', 'gradientColors', 'to'], e.target.value);
                        }}
                        placeholder="#10B981"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Button</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.coursesByCategory?.buttonText || ''}
                    onChange={(e) => updateContent(['coursesByCategory', 'buttonText'], e.target.value)}
                    placeholder="Button text"
                  />
                  <AttractiveInput
                    value={content.coursesByCategory?.buttonHref || ''}
                    onChange={(e) => updateContent(['coursesByCategory', 'buttonHref'], e.target.value)}
                    placeholder="Button URL"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient From</label>
                    <input
                      type="color"
                      value={content.coursesByCategory?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['coursesByCategory', 'buttonGradientFrom'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.coursesByCategory?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['coursesByCategory', 'buttonGradientFrom'], e.target.value)}
                      placeholder="#EC4899"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Gradient To</label>
                    <input
                      type="color"
                      value={content.coursesByCategory?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['coursesByCategory', 'buttonGradientTo'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.coursesByCategory?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['coursesByCategory', 'buttonGradientTo'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download App Section */}
        {activeTab === 'downloadApp' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DownloadIcon className="w-5 h-5" />
                Download App Section Settings
              </CardTitle>
              <CardDescription>Configure the download app section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Label</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.downloadApp?.label?.text || ''}
                    onChange={(e) => updateContent(['downloadApp', 'label', 'text'], e.target.value)}
                    placeholder="Label text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Background Color</label>
                    <input
                      type="color"
                      value={content.downloadApp?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['downloadApp', 'label', 'backgroundColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.downloadApp?.label?.backgroundColor || '#A855F7'}
                      onChange={(e) => updateContent(['downloadApp', 'label', 'backgroundColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Title Parts */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Title Parts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7'].map((part) => (
                    <div key={part}>
                      <AttractiveInput
                        value={content.downloadApp?.title?.[part as keyof typeof content.downloadApp.title] || ''}
                        onChange={(e) => updateContent(['downloadApp', 'title', part], e.target.value)}
                        placeholder={`Title ${part}`}
                        className="mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={content.downloadApp?.titleColors?.[part as keyof typeof content.downloadApp.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            updateContent(['downloadApp', 'titleColors', part], e.target.value);
                          }}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.titleColors?.[part as keyof typeof content.downloadApp.titleColors] || '#1E3A8A'}
                          onChange={(e) => {
                            updateContent(['downloadApp', 'titleColors', part], e.target.value);
                          }}
                          placeholder="#1E3A8A"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Description</label>
                <CustomEditor
                  value={content.downloadApp?.description || ''}
                  onChange={(data) => updateContent(['downloadApp', 'description'], data)}
                  placeholder="Description text"
                />
              </div>

              {/* Download Buttons */}
              <div className="space-y-6">
                <label className="text-sm font-semibold mb-2 block">Download Buttons</label>
                
                {/* Google Play Button */}
                <Card className="p-4">
                  <CardContent className="space-y-4">
                    <h4 className="text-sm font-semibold">Google Play Button</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Button Text</label>
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.googlePlay?.text || ''}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'text'], e.target.value)}
                          placeholder="Google Play এ পান"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Button URL</label>
                        <Input
                          type="url"
                          value={content.downloadApp?.buttons?.googlePlay?.href || ''}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'href'], e.target.value)}
                          placeholder="https://play.google.com/..."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Gradient From</label>
                        <input
                          type="color"
                          value={content.downloadApp?.buttons?.googlePlay?.gradientFrom || '#A855F7'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'gradientFrom'], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.googlePlay?.gradientFrom || '#A855F7'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'gradientFrom'], e.target.value)}
                          placeholder="#A855F7"
                          className="flex-1 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Gradient To</label>
                        <input
                          type="color"
                          value={content.downloadApp?.buttons?.googlePlay?.gradientTo || '#9333EA'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'gradientTo'], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.googlePlay?.gradientTo || '#9333EA'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'googlePlay', 'gradientTo'], e.target.value)}
                          placeholder="#9333EA"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* App Store Button */}
                <Card className="p-4">
                  <CardContent className="space-y-4">
                    <h4 className="text-sm font-semibold">App Store Button</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Button Text</label>
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.appStore?.text || ''}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'text'], e.target.value)}
                          placeholder="App Store এ পান"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Button URL</label>
                        <Input
                          type="url"
                          value={content.downloadApp?.buttons?.appStore?.href || ''}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'href'], e.target.value)}
                          placeholder="https://apps.apple.com/..."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Gradient From</label>
                        <input
                          type="color"
                          value={content.downloadApp?.buttons?.appStore?.gradientFrom || '#FF6B35'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientFrom'], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.appStore?.gradientFrom || '#FF6B35'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientFrom'], e.target.value)}
                          placeholder="#FF6B35"
                          className="flex-1 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Gradient Via (Optional)</label>
                        <input
                          type="color"
                          value={content.downloadApp?.buttons?.appStore?.gradientVia || '#FF8C42'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientVia'], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.appStore?.gradientVia || '#FF8C42'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientVia'], e.target.value)}
                          placeholder="#FF8C42"
                          className="flex-1 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Gradient To</label>
                        <input
                          type="color"
                          value={content.downloadApp?.buttons?.appStore?.gradientTo || '#FFB84D'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientTo'], e.target.value)}
                          className="h-8 w-16 rounded border"
                        />
                        <Input
                          type="text"
                          value={content.downloadApp?.buttons?.appStore?.gradientTo || '#FFB84D'}
                          onChange={(e) => updateContent(['downloadApp', 'buttons', 'appStore', 'gradientTo'], e.target.value)}
                          placeholder="#FFB84D"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Background Image */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Background Image URL</label>
                <Input
                  type="url"
                  value={content.downloadApp?.backgroundImage || ''}
                  onChange={(e) => updateContent(['downloadApp', 'backgroundImage'], e.target.value)}
                  placeholder="https://example.com/download-image.png"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Section */}
        {activeTab === 'footer' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutIcon className="w-5 h-5" />
                Footer Section Settings
              </CardTitle>
              <CardDescription>Configure the footer content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Branding */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Branding</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.footer?.branding?.logoText || ''}
                    onChange={(e) => updateContent(['footer', 'branding', 'logoText'], e.target.value)}
                    placeholder="Logo Text"
                  />
                  <AttractiveInput
                    value={content.footer?.branding?.logoIcon || ''}
                    onChange={(e) => updateContent(['footer', 'branding', 'logoIcon'], e.target.value)}
                    placeholder="Logo Icon (single character)"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Icon Color</label>
                    <input
                      type="color"
                      value={content.footer?.branding?.logoIconColor || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'branding', 'logoIconColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.branding?.logoIconColor || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'branding', 'logoIconColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Text Color</label>
                    <input
                      type="color"
                      value={content.footer?.branding?.logoTextColor || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'branding', 'logoTextColor'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.branding?.logoTextColor || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'branding', 'logoTextColor'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
                <CustomEditor
                  value={content.footer?.branding?.description || ''}
                  onChange={(data) => updateContent(['footer', 'branding', 'description'], data)}
                  placeholder="Description"
                />
              </div>

              {/* Newsletter */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Newsletter</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttractiveInput
                    value={content.footer?.newsletter?.title || ''}
                    onChange={(e) => updateContent(['footer', 'newsletter', 'title'], e.target.value)}
                    placeholder="Newsletter Title"
                  />
                  <AttractiveInput
                    value={content.footer?.newsletter?.emailPlaceholder || ''}
                    onChange={(e) => updateContent(['footer', 'newsletter', 'emailPlaceholder'], e.target.value)}
                    placeholder="Email Placeholder"
                  />
                  <AttractiveInput
                    value={content.footer?.newsletter?.buttonText || ''}
                    onChange={(e) => updateContent(['footer', 'newsletter', 'buttonText'], e.target.value)}
                    placeholder="Button Text"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Button Gradient From</label>
                    <input
                      type="color"
                      value={content.footer?.newsletter?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['footer', 'newsletter', 'buttonGradientFrom'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.newsletter?.buttonGradientFrom || '#EC4899'}
                      onChange={(e) => updateContent(['footer', 'newsletter', 'buttonGradientFrom'], e.target.value)}
                      placeholder="#EC4899"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Button Gradient To</label>
                    <input
                      type="color"
                      value={content.footer?.newsletter?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'newsletter', 'buttonGradientTo'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.newsletter?.buttonGradientTo || '#A855F7'}
                      onChange={(e) => updateContent(['footer', 'newsletter', 'buttonGradientTo'], e.target.value)}
                      placeholder="#A855F7"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Company Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Company Links</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentLinks = content.footer?.companyLinks && content.footer.companyLinks.length > 0 
                        ? content.footer.companyLinks 
                        : defaultFooterContent.companyLinks;
                      const newLinks = [...currentLinks, { label: '', href: '#' }];
                      updateContent(['footer', 'companyLinks'], newLinks);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                {(content.footer?.companyLinks && content.footer.companyLinks.length > 0 
                  ? content.footer.companyLinks 
                  : defaultFooterContent.companyLinks).map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updatedLinks = [...(content.footer?.companyLinks || defaultFooterContent.companyLinks)];
                        updatedLinks[index] = { ...updatedLinks[index], label: e.target.value };
                        updateContent(['footer', 'companyLinks'], updatedLinks);
                      }}
                      placeholder="Link Label"
                      className="flex-1"
                    />
                    <Input
                      type="url"
                      value={link.href}
                      onChange={(e) => {
                        const updatedLinks = [...(content.footer?.companyLinks || defaultFooterContent.companyLinks)];
                        updatedLinks[index] = { ...updatedLinks[index], href: e.target.value };
                        updateContent(['footer', 'companyLinks'], updatedLinks);
                      }}
                      placeholder="Link URL"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedLinks = (content.footer?.companyLinks || defaultFooterContent.companyLinks).filter((_, i) => i !== index);
                        updateContent(['footer', 'companyLinks'], updatedLinks);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Quick Links</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentLinks = content.footer?.quickLinks && content.footer.quickLinks.length > 0 
                        ? content.footer.quickLinks 
                        : defaultFooterContent.quickLinks;
                      const newLinks = [...currentLinks, { label: '', href: '#' }];
                      updateContent(['footer', 'quickLinks'], newLinks);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                {(content.footer?.quickLinks && content.footer.quickLinks.length > 0 
                  ? content.footer.quickLinks 
                  : defaultFooterContent.quickLinks).map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const updatedLinks = [...(content.footer?.quickLinks || defaultFooterContent.quickLinks)];
                        updatedLinks[index] = { ...updatedLinks[index], label: e.target.value };
                        updateContent(['footer', 'quickLinks'], updatedLinks);
                      }}
                      placeholder="Link Label"
                      className="flex-1"
                    />
                    <Input
                      type="url"
                      value={link.href}
                      onChange={(e) => {
                        const updatedLinks = [...(content.footer?.quickLinks || defaultFooterContent.quickLinks)];
                        updatedLinks[index] = { ...updatedLinks[index], href: e.target.value };
                        updateContent(['footer', 'quickLinks'], updatedLinks);
                      }}
                      placeholder="Link URL"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedLinks = (content.footer?.quickLinks || defaultFooterContent.quickLinks).filter((_, i) => i !== index);
                        updateContent(['footer', 'quickLinks'], updatedLinks);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Contact Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Address Label</label>
                    <Input
                      type="text"
                      value={content.footer?.contact?.address?.label || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'address', 'label'], e.target.value)}
                      placeholder="Address Label"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Address Value</label>
                    <Input
                      type="text"
                      value={content.footer?.contact?.address?.value || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'address', 'value'], e.target.value)}
                      placeholder="Address Value"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Phone Label</label>
                    <Input
                      type="text"
                      value={content.footer?.contact?.phone?.label || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'phone', 'label'], e.target.value)}
                      placeholder="Phone Label"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Phone Value</label>
                    <Input
                      type="text"
                      value={content.footer?.contact?.phone?.value || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'phone', 'value'], e.target.value)}
                      placeholder="Phone Value"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Email Label</label>
                    <Input
                      type="text"
                      value={content.footer?.contact?.email?.label || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'email', 'label'], e.target.value)}
                      placeholder="Email Label"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Email Value</label>
                    <Input
                      type="email"
                      value={content.footer?.contact?.email?.value || ''}
                      onChange={(e) => updateContent(['footer', 'contact', 'email', 'value'], e.target.value)}
                      placeholder="Email Value"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Gateway */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Payment Gateway</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentMethods = content.footer?.paymentGateway?.methods && content.footer.paymentGateway.methods.length > 0 
                        ? content.footer.paymentGateway.methods 
                        : defaultFooterContent.paymentGateway.methods;
                      const newMethods = [...currentMethods, ''];
                      updateContent(['footer', 'paymentGateway', 'methods'], newMethods);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Method
                  </Button>
                </div>
                <AttractiveInput
                  value={content.footer?.paymentGateway?.title || ''}
                  onChange={(e) => updateContent(['footer', 'paymentGateway', 'title'], e.target.value)}
                  placeholder="Payment Gateway Title"
                />
                {(content.footer?.paymentGateway?.methods && content.footer.paymentGateway.methods.length > 0 
                  ? content.footer.paymentGateway.methods 
                  : defaultFooterContent.paymentGateway.methods).map((method, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={method}
                      onChange={(e) => {
                        const updatedMethods = [...(content.footer?.paymentGateway?.methods || defaultFooterContent.paymentGateway.methods)];
                        updatedMethods[index] = e.target.value;
                        updateContent(['footer', 'paymentGateway', 'methods'], updatedMethods);
                      }}
                      placeholder="Payment Method Name"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedMethods = (content.footer?.paymentGateway?.methods || defaultFooterContent.paymentGateway.methods).filter((_, i) => i !== index);
                        updateContent(['footer', 'paymentGateway', 'methods'], updatedMethods);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Copyright */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Copyright Text</label>
                <Input
                  type="text"
                  value={content.footer?.copyright || ''}
                  onChange={(e) => updateContent(['footer', 'copyright'], e.target.value)}
                  placeholder="Copyright Text"
                />
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Social Media</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentSocial = content.footer?.socialMedia && content.footer.socialMedia.length > 0 
                        ? content.footer.socialMedia 
                        : defaultFooterContent.socialMedia;
                      const newSocial = [...currentSocial, { name: '', icon: '', color: '#000000', href: '#' }];
                      updateContent(['footer', 'socialMedia'], newSocial);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Social Media
                  </Button>
                </div>
                {(content.footer?.socialMedia && content.footer.socialMedia.length > 0 
                  ? content.footer.socialMedia 
                  : defaultFooterContent.socialMedia).map((social, index) => (
                  <Card key={index} className="p-4">
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          value={social.name}
                          onChange={(e) => {
                            const updatedSocial = [...(content.footer?.socialMedia || defaultFooterContent.socialMedia)];
                            updatedSocial[index] = { ...updatedSocial[index], name: e.target.value };
                            updateContent(['footer', 'socialMedia'], updatedSocial);
                          }}
                          placeholder="Social Media Name"
                        />
                        <Input
                          type="url"
                          value={social.href}
                          onChange={(e) => {
                            const updatedSocial = [...(content.footer?.socialMedia || defaultFooterContent.socialMedia)];
                            updatedSocial[index] = { ...updatedSocial[index], href: e.target.value };
                            updateContent(['footer', 'socialMedia'], updatedSocial);
                          }}
                          placeholder="Social Media URL"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          value={social.icon}
                          onChange={(e) => {
                            const updatedSocial = [...(content.footer?.socialMedia || defaultFooterContent.socialMedia)];
                            updatedSocial[index] = { ...updatedSocial[index], icon: e.target.value };
                            updateContent(['footer', 'socialMedia'], updatedSocial);
                          }}
                          placeholder="SVG Path (icon)"
                        />
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Color</label>
                          <input
                            type="color"
                            value={social.color}
                            onChange={(e) => {
                              const updatedSocial = [...(content.footer?.socialMedia || defaultFooterContent.socialMedia)];
                              updatedSocial[index] = { ...updatedSocial[index], color: e.target.value };
                              updateContent(['footer', 'socialMedia'], updatedSocial);
                            }}
                            className="h-8 w-16 rounded border"
                          />
                          <Input
                            type="text"
                            value={social.color}
                            onChange={(e) => {
                              const updatedSocial = [...(content.footer?.socialMedia || defaultFooterContent.socialMedia)];
                              updatedSocial[index] = { ...updatedSocial[index], color: e.target.value };
                              updateContent(['footer', 'socialMedia'], updatedSocial);
                            }}
                            placeholder="#000000"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const updatedSocial = (content.footer?.socialMedia || defaultFooterContent.socialMedia).filter((_, i) => i !== index);
                          updateContent(['footer', 'socialMedia'], updatedSocial);
                        }}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Background Gradient */}
              <div className="space-y-4">
                <label className="text-sm font-semibold mb-2 block">Background Gradient</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">From</label>
                    <input
                      type="color"
                      value={content.footer?.backgroundGradient?.from || '#FFF5E6'}
                      onChange={(e) => updateContent(['footer', 'backgroundGradient', 'from'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.backgroundGradient?.from || '#FFF5E6'}
                      onChange={(e) => updateContent(['footer', 'backgroundGradient', 'from'], e.target.value)}
                      placeholder="#FFF5E6"
                      className="flex-1 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">To</label>
                    <input
                      type="color"
                      value={content.footer?.backgroundGradient?.to || '#E0F2FE'}
                      onChange={(e) => updateContent(['footer', 'backgroundGradient', 'to'], e.target.value)}
                      className="h-8 w-16 rounded border"
                    />
                    <Input
                      type="text"
                      value={content.footer?.backgroundGradient?.to || '#E0F2FE'}
                      onChange={(e) => updateContent(['footer', 'backgroundGradient', 'to'], e.target.value)}
                      placeholder="#E0F2FE"
                      className="flex-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Order */}
        {activeTab === 'sectionOrder' && content && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Section Order Management
              </CardTitle>
              <CardDescription>Drag and drop to reorder sections, or use checkboxes to enable/disable them</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const sections = (content.sectionOrder && content.sectionOrder.length > 0 
                  ? content.sectionOrder 
                  : defaultSectionOrder)
                  .sort((a, b) => a.order - b.order);

                const handleDragEnd = (event: DragEndEvent) => {
                  const { active, over } = event;

                  if (over && active.id !== over.id) {
                    const oldIndex = sections.findIndex(s => s.id === active.id);
                    const newIndex = sections.findIndex(s => s.id === over.id);

                    const reorderedSections = arrayMove(sections, oldIndex, newIndex);
                    
                    // Update order numbers
                    const updatedSections = reorderedSections.map((section, index) => ({
                      ...section,
                      order: index
                    }));

                    updateContent(['sectionOrder'], updatedSections);
                  }
                };

                return (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sections.map(s => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sections.map((section) => (
                          <DraggableSectionItem
                            key={section.id}
                            section={section}
                            onToggle={(enabled) => {
                              const updatedOrder = [...(content.sectionOrder || defaultSectionOrder)];
                              const sectionIndex = updatedOrder.findIndex(s => s.id === section.id);
                              if (sectionIndex !== -1) {
                                updatedOrder[sectionIndex] = { ...updatedOrder[sectionIndex], enabled };
                                updateContent(['sectionOrder'], updatedOrder);
                              }
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                );
              })()}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset to default order
                    const resetOrder = defaultSectionOrder.map((section, index) => ({
                      ...section,
                      order: index
                    }));
                    updateContent(['sectionOrder'], resetOrder);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Default Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Marquee Banner */}
        {activeTab === 'marquee' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Marquee Banner Settings
              </CardTitle>
              <CardDescription>Configure the scrolling banner at the top of the header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold">Enable Marquee</label>
                  <p className="text-sm text-gray-500">Show/hide the marquee banner</p>
                </div>
                <button
                  onClick={() => updateContent(['marquee', 'enabled'], !content.marquee.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    content.marquee.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      content.marquee.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Marquee Messages</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addMarqueeMessage}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Message
                  </Button>
                </div>
                {content.marquee.messages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={message}
                      onChange={(e) => {
                        const newMessages = [...content.marquee.messages];
                        newMessages[index] = e.target.value;
                        updateContent(['marquee', 'messages'], newMessages);
                      }}
                      placeholder="Enter marquee message"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMarqueeMessage(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Gradient Start Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.marquee.gradientFrom}
                      onChange={(e) => updateContent(['marquee', 'gradientFrom'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.marquee.gradientFrom}
                      onChange={(e) => updateContent(['marquee', 'gradientFrom'], e.target.value)}
                      placeholder="#EC4899"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Gradient End Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.marquee.gradientTo}
                      onChange={(e) => updateContent(['marquee', 'gradientTo'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.marquee.gradientTo}
                      onChange={(e) => updateContent(['marquee', 'gradientTo'], e.target.value)}
                      placeholder="#A855F7"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        {activeTab === 'contact' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Registration Information
              </CardTitle>
              <CardDescription>Update government registration number displayed in header</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                <label className="text-sm font-semibold mb-2 block">Registration Number</label>
                  <Input
                  value={content.contact?.registrationNumber || ''}
                  onChange={(e) => updateContent(['contact', 'registrationNumber'], e.target.value)}
                  placeholder="বাংলাদেশ সরকার অনুমোদিত রেজিঃ নং- ৩১১০৫"
                  className="w-full"
                  />
                <p className="text-xs text-gray-500 mt-2">
                  This text will be displayed in the subheader section of the website
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        {activeTab === 'social' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Configure social media profile URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Facebook URL</label>
                <Input
                  value={content.socialMedia.facebook}
                  onChange={(e) => updateContent(['socialMedia', 'facebook'], e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Twitter/X URL</label>
                <Input
                  value={content.socialMedia.twitter}
                  onChange={(e) => updateContent(['socialMedia', 'twitter'], e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">LinkedIn URL</label>
                <Input
                  value={content.socialMedia.linkedin}
                  onChange={(e) => updateContent(['socialMedia', 'linkedin'], e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              {content.socialMedia.instagram && (
                <div>
                  <label className="text-sm font-semibold mb-2 block">Instagram URL</label>
                  <Input
                    value={content.socialMedia.instagram}
                    onChange={(e) => updateContent(['socialMedia', 'instagram'], e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
              )}
              {content.socialMedia.youtube && (
                <div>
                  <label className="text-sm font-semibold mb-2 block">YouTube URL</label>
                  <Input
                    value={content.socialMedia.youtube}
                    onChange={(e) => updateContent(['socialMedia', 'youtube'], e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Branding */}
        {activeTab === 'branding' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding & Logo
              </CardTitle>
              <CardDescription>Customize logo, favicon, meta title and brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-semibold mb-2 block">Website Meta Title</label>
                <Input
                  value={content.metaTitle || ''}
                  onChange={(e) => updateContent(['metaTitle'], e.target.value)}
                  placeholder="Your institute website title"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-semibold block">à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦ Logo</label>
                  {content.branding.logoUrl ? (
                    <img
                      src={content.branding.logoUrl}
                      alt="à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦ logo"
                      className="h-16 w-16 rounded border object-contain bg-white"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                      No logo
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.ico"
                      onChange={(e) => handleBrandingUpload(e, 'logo')}
                      disabled={uploadingAsset === 'logo'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateContent(['branding', 'logoUrl'], '')}
                      disabled={!content.branding.logoUrl || uploadingAsset === 'logo'}
                    >
                      Remove
                    </Button>
                  </div>
                  {uploadingAsset === 'logo' && <p className="text-xs text-gray-500">Uploading logo...</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold block">Favicon</label>
                  {content.branding.faviconUrl ? (
                    <img
                      src={content.branding.faviconUrl}
                      alt="Website favicon"
                      className="h-16 w-16 rounded border object-contain bg-white"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded border bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                      No favicon
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,.ico"
                      onChange={(e) => handleBrandingUpload(e, 'favicon')}
                      disabled={uploadingAsset === 'favicon'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateContent(['branding', 'faviconUrl'], '')}
                      disabled={!content.branding.faviconUrl || uploadingAsset === 'favicon'}
                    >
                      Remove
                    </Button>
                  </div>
                  {uploadingAsset === 'favicon' && <p className="text-xs text-gray-500">Uploading favicon...</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Logo Text</label>
                <Input
                  value={content.branding.logoText}
                  onChange={(e) => updateContent(['branding', 'logoText'], e.target.value)}
                  placeholder="à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Logo Text Color 1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.branding.logoTextColor1}
                      onChange={(e) => updateContent(['branding', 'logoTextColor1'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.branding.logoTextColor1}
                      onChange={(e) => updateContent(['branding', 'logoTextColor1'], e.target.value)}
                      placeholder="#7B2CBF"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Logo Text Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.branding.logoTextColor2}
                      onChange={(e) => updateContent(['branding', 'logoTextColor2'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.branding.logoTextColor2}
                      onChange={(e) => updateContent(['branding', 'logoTextColor2'], e.target.value)}
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Logo Icon Color 1</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.branding.logoIconColor1}
                      onChange={(e) => updateContent(['branding', 'logoIconColor1'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.branding.logoIconColor1}
                      onChange={(e) => updateContent(['branding', 'logoIconColor1'], e.target.value)}
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Logo Icon Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.branding.logoIconColor2}
                      onChange={(e) => updateContent(['branding', 'logoIconColor2'], e.target.value)}
                      className="h-10 w-20 rounded border"
                    />
                    <Input
                      value={content.branding.logoIconColor2}
                      onChange={(e) => updateContent(['branding', 'logoIconColor2'], e.target.value)}
                      placeholder="#7B2CBF"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            {Object.entries(content.navigation).map(([sectionKey, section]) => {
              if (sectionKey === 'contact' && 'href' in section) {
                return (
                  <Card key={sectionKey}>
                    <CardHeader>
                      <CardTitle>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Label</label>
                          <Input
                            value={section.label}
                            onChange={(e) => updateContent(['navigation', sectionKey, 'label'], e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-2 block">URL</label>
                          <Input
                            value={section.href}
                            onChange={(e) => updateContent(['navigation', sectionKey, 'href'], e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              if ('items' in section && Array.isArray(section.items)) {
                return (
                  <Card key={sectionKey}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Menu</CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addNavItem(sectionKey)}
                          className="flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Menu Label</label>
                        <Input
                          value={section.label}
                          onChange={(e) => updateContent(['navigation', sectionKey, 'label'], e.target.value)}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        {section.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input
                              value={item.label}
                              onChange={(e) => {
                                const newItems = [...section.items];
                                newItems[index] = { ...newItems[index], label: e.target.value };
                                updateContent(['navigation', sectionKey, 'items'], newItems);
                              }}
                              placeholder="Label"
                            />
                            <Input
                              value={item.href}
                              onChange={(e) => {
                                const newItems = [...section.items];
                                newItems[index] = { ...newItems[index], href: e.target.value };
                                updateContent(['navigation', sectionKey, 'items'], newItems);
                              }}
                              placeholder="/path"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeNavItem(sectionKey, index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Buttons */}
        {activeTab === 'buttons' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Button Settings
              </CardTitle>
              <CardDescription>Configure header buttons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold">Enable Live Course Button</label>
                    <p className="text-sm text-gray-500">Show/hide the live course button</p>
                  </div>
                  <button
                    onClick={() => updateContent(['buttons', 'liveCourse', 'enabled'], !content.buttons.liveCourse.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      content.buttons.liveCourse.enabled ? 'bg-[#7B2CBF]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        content.buttons.liveCourse.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Live Course Button Text</label>
                  <Input
                    value={content.buttons.liveCourse.text}
                    onChange={(e) => updateContent(['buttons', 'liveCourse', 'text'], e.target.value)}
                    placeholder="লাইভ কোর্স"
                  />
                </div>
                {content.buttons.liveCourse.href && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Live Course Button URL</label>
                    <Input
                      value={content.buttons.liveCourse.href}
                      onChange={(e) => updateContent(['buttons', 'liveCourse', 'href'], e.target.value)}
                      placeholder="/live-courses"
                    />
                  </div>
                )}
              </div>
              <Separator />
              <div>
                <label className="text-sm font-semibold mb-2 block">Login Button Text</label>
                <Input
                  value={content.buttons.login.text}
                  onChange={(e) => updateContent(['buttons', 'login', 'text'], e.target.value)}
                  placeholder="লগ ইন"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Login Button URL</label>
                <Input
                  value={content.buttons.login.href}
                  onChange={(e) => updateContent(['buttons', 'login', 'href'], e.target.value)}
                  placeholder="/login"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Menu */}
        {activeTab === 'mobile' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Mobile Menu Items
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newItems = [...content.mobileMenu.items, { label: '', href: '' }];
                    updateContent(['mobileMenu', 'items'], newItems);
                  }}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
              <CardDescription>Configure mobile menu navigation items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.mobileMenu.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const newItems = [...content.mobileMenu.items];
                        newItems[index] = { ...newItems[index], label: e.target.value };
                        updateContent(['mobileMenu', 'items'], newItems);
                      }}
                      placeholder="Label"
                    />
                    <Input
                      value={item.href}
                      onChange={(e) => {
                        const newItems = [...content.mobileMenu.items];
                        newItems[index] = { ...newItems[index], href: e.target.value };
                        updateContent(['mobileMenu', 'items'], newItems);
                      }}
                      placeholder="/path"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newItems = content.mobileMenu.items.filter((_, i) => i !== index);
                      updateContent(['mobileMenu', 'items'], newItems);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
          </div>
        </PageSection>
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
