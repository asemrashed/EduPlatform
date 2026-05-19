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
  LuChartBar as BarChart,
  LuLayers as Layers,
} from 'react-icons/lu';
import type { FutureSubTab } from './sections/FutureSections';

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
      { id: 'whyChooseUs', label: 'Why Choose Us', icon: Star },
      { id: 'statistics', label: 'Statistics', icon: BarChart },
      { id: 'faq', label: 'FAQ', icon: MessageSquare },
      { id: 'partners', label: 'Partners', icon: Briefcase },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'promoBanner', label: 'Promo Banners', icon: ImageIcon },
      { id: 'sectionOrder', label: 'Section Order', icon: Settings },
    ],
  },
  {
    label: 'Pages',
    items: [
      { id: 'about', label: 'About Page', icon: Info },
      { id: 'contactPage', label: 'Contact Page', icon: Phone },
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
    items: [{ id: 'courses', label: 'Featured Courses', icon: Briefcase }],
  },
  {
    label: 'Navigation',
    items: [
      { id: 'navigation', label: 'Header & Nav', icon: Navigation },
      { id: 'footer', label: 'Footer', icon: LayoutIcon },
    ],
  },
  {
    label: 'More',
    items: [{ id: 'services', label: 'More Sections', icon: Layers, badge: 'Unused', dimmed: true }],
  },
];

export const MORE_TAB_IDS: FutureSubTab[] = [
  'services',
  'certificates',
  'photoGallery',
  'blog',
  'downloadApp',
];

const HOME_FEATURE_TABS = new Set(['whyChooseUs', 'statistics']);

export function isMoreTab(tabId: string): boolean {
  return MORE_TAB_IDS.includes(tabId as FutureSubTab);
}

export function isFutureTab(tabId: string): boolean {
  return isMoreTab(tabId) || HOME_FEATURE_TABS.has(tabId);
}

export function isCmsTabActive(activeTab: string, itemId: string): boolean {
  if (activeTab === itemId) return true;
  if (itemId === 'promoBanner' && activeTab === 'courseLessonBanner') return true;
  if (itemId === 'contact' && activeTab === 'social') return true;
  if (itemId === 'courses' && activeTab === 'coursesByCategory') return true;
  if (itemId === 'navigation' && activeTab === 'buttons') return true;
  if (itemId === 'services' && isMoreTab(activeTab)) return true;
  if (itemId === 'whyChooseUs' && activeTab === 'whyChooseUs') return true;
  if (itemId === 'statistics' && activeTab === 'statistics') return true;
  return false;
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
  if (tabId === 'partners') return 'Partners';
  if (tabId === 'contactPage') return 'Contact Page';
  if (tabId === 'whyChooseUs') return 'Why Choose Us';
  if (tabId === 'statistics') return 'Statistics';
  if (isMoreTab(tabId)) return 'More Sections';
  return tabId;
}
