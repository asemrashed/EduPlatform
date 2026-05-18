import type { IconType } from 'react-icons';
import {
  LuSparkles as Sparkles,
  LuInfo as Info,
  LuMessageSquare as MessageSquare,
  LuImage as ImageIcon,
  LuLayoutList as LayoutIcon,
  LuPalette as Palette,
  LuPhone as Phone,
  LuBriefcase as Briefcase,
  LuStar as Star,
  LuNavigation as Navigation,
  LuSettings as Settings,
  LuFileText as FileText,
} from 'react-icons/lu';

export type CmsTabId = string;

export interface CmsSidebarItem {
  id: CmsTabId;
  label: string;
  icon: IconType;
  badge?: 'Coming Soon' | 'Unused';
  dimmed?: boolean;
}

export interface CmsSidebarGroup {
  label: string;
  items: CmsSidebarItem[];
}

export const CMS_SIDEBAR_GROUPS: CmsSidebarGroup[] = [
  {
    label: 'Home Page',
    items: [
      { id: 'hero', label: 'Hero', icon: Sparkles },
      { id: 'about', label: 'About', icon: Info },
      { id: 'faq', label: 'FAQ', icon: MessageSquare },
      { id: 'promoBanner', label: 'Promo Banners', icon: ImageIcon },
      { id: 'sectionOrder', label: 'Section Order', icon: Settings },
    ],
  },
  {
    label: 'Global Settings',
    items: [
      { id: 'branding', label: 'Branding', icon: Palette },
      { id: 'contact', label: 'Contact & Social', icon: Phone },
      { id: 'marquee', label: 'Marquee', icon: MessageSquare },
    ],
  },
  {
    label: 'Student Portal',
    items: [
      { id: 'courses', label: 'Featured Courses', icon: Briefcase },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    label: 'Navigation (Phase 13.4.11–12)',
    items: [
      { id: 'navigation', label: 'Header & Nav', icon: Navigation, badge: 'Coming Soon', dimmed: true },
      { id: 'footer', label: 'Footer', icon: LayoutIcon, badge: 'Coming Soon', dimmed: true },
    ],
  },
  {
    label: 'Future Sections',
    items: [{ id: 'whyChooseUs', label: 'Future Sections', icon: FileText, badge: 'Unused', dimmed: true }],
  },
];

const FUTURE_TAB_IDS = new Set([
  'whyChooseUs',
  'statistics',
  'services',
  'certificates',
  'photoGallery',
  'blog',
  'downloadApp',
]);

export function isFutureTab(tabId: string): boolean {
  return FUTURE_TAB_IDS.has(tabId);
}

export function getCmsTabLabel(tabId: string): string {
  for (const group of CMS_SIDEBAR_GROUPS) {
    const item = group.items.find((i) => i.id === tabId);
    if (item) return item.label;
  }
  if (tabId === 'courseLessonBanner') return 'Course Lesson Banner';
  if (tabId === 'coursesByCategory') return 'Courses by Category';
  if (tabId === 'social') return 'Social Media';
  if (tabId === 'buttons') return 'Buttons';
  if (tabId === 'mobile') return 'Mobile Menu';
  if (isFutureTab(tabId)) return 'Future Sections';
  return tabId;
}
