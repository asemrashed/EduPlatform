'use client';

import Image from 'next/image';
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
import CustomEditor from '@/components/custom-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { CmsImageField } from './CmsImageField';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import VideoWatermark from '@/components/VideoWatermark';
import {
  LuRefreshCw as RefreshCw,
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
} from 'react-icons/lu';
import {
  defaultSectionOrder,
} from '@/lib/websiteContentDefaults';
import type { WebsiteContent } from './types';


interface HeroSectionProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
}

export function HeroSection({ content, updateContent }: HeroSectionProps) {
  return (
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
                            <CmsImageField
                              label="Carousel image"
                              value={item.image}
                              onChange={(url) => {
                                const newItems = [...(content.hero?.carousel?.items || [])];
                                newItems[index] = { ...newItems[index], image: url };
                                updateContent(['hero', 'carousel', 'items'], newItems);
                              }}
                              previewAlt={`Carousel ${index + 1}`}
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
  );
}
