'use client';

import { Badge } from '@/components/ui/badge';
import type { CmsSidebarGroup } from './cmsSidebarConfig';

interface CmsContentSidebarProps {
  groups: CmsSidebarGroup[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export function CmsContentSidebar({ groups, activeTab, onSelectTab }: CmsContentSidebarProps) {
  return (
    <aside className="w-full shrink-0 md:w-[220px] md:border-r md:border-gray-200 md:pr-4">
      <nav className="space-y-5" aria-label="CMS content sections">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wider text-[#7B2CBF]/60 sm:block">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'promoBanner' && activeTab === 'courseLessonBanner') ||
                  (item.id === 'contact' && activeTab === 'social') ||
                  (item.id === 'courses' && activeTab === 'coursesByCategory') ||
                  (item.id === 'navigation' &&
                    (activeTab === 'buttons' || activeTab === 'mobile')) ||
                  (item.id === 'whyChooseUs' &&
                    [
                      'whyChooseUs',
                      'statistics',
                      'services',
                      'certificates',
                      'photoGallery',
                      'blog',
                      'downloadApp',
                    ].includes(activeTab));

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                        isActive
                          ? 'border-l-4 border-[#A855F7] bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-[#EC4899]'
                          : item.dimmed
                            ? 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                            : 'text-gray-600 hover:bg-[#7B2CBF]/5 hover:text-[#7B2CBF]'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#EC4899]' : 'text-gray-400'}`}
                      />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 ${
                            item.badge === 'Coming Soon'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-gray-200 bg-gray-50 text-gray-500'
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
