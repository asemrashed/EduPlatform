'use client';

import type { WebsiteContent } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CustomEditor from '@/components/custom-editor';
import Image from 'next/image';
import {
  defaultBlogContent,
  defaultCertificatesContent,
  defaultPhotoGalleryContent,
  defaultServicesContent,
  defaultStatisticsContent,
  defaultWhyChooseUsContent,
} from '@/lib/websiteContentDefaults';
import {
  LuRefreshCw as RefreshCw, LuPlus as Plus, LuTrash2 as Trash,
  LuSparkles as Sparkles, LuInfo as Info, LuStar as Star, LuChartBar as BarChart,
  LuBriefcase as Briefcase, LuAward as Award, LuImage as ImageIcon, LuFileText as FileText,
  LuDownload as DownloadIcon, LuSettings as Settings,
} from 'react-icons/lu';

export type FutureSubTab =
  | 'whyChooseUs'
  | 'statistics'
  | 'services'
  | 'certificates'
  | 'photoGallery'
  | 'blog'
  | 'downloadApp';

interface FutureSectionsProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
  activeSubTab: FutureSubTab;
  onSubTabChange: (tab: FutureSubTab) => void;
}

export function FutureSections({ content, updateContent, activeSubTab, onSubTabChange }: FutureSectionsProps) {
  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        {([
          { id: 'whyChooseUs' as const, label: 'Why Choose Us' },
          { id: 'statistics' as const, label: 'Statistics' },
          { id: 'services' as const, label: 'Services' },
          { id: 'certificates' as const, label: 'Certificates' },
          { id: 'photoGallery' as const, label: 'Photo Gallery' },
          { id: 'blog' as const, label: 'Blog' },
          { id: 'downloadApp' as const, label: 'Download App' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeSubTab === tab.id
                ? 'bg-[#7B2CBF]/10 text-[#7B2CBF]'
                : 'text-gray-600 hover:text-[#7B2CBF] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {(() => {
        switch (activeSubTab) {
          case 'whyChooseUs':
            return (
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
            );
          case 'statistics':
            return (
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
            );
          case 'services':
            return (
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
            );
          case 'certificates':
            return (
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
            );
          case 'photoGallery':
            return (
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
            );
          case 'blog':
            return (
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
            );
          case 'downloadApp':
            return (
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
            );
          default:
            return null;
        }
      })()}
    </>
  );
}
