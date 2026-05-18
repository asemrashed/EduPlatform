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
  defaultAboutContent,
} from '@/lib/websiteContentDefaults';
import type { WebsiteContent } from './types';


interface AboutSectionProps {
content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
}

export function AboutSection({ content, updateContent }: AboutSectionProps) {
  return (
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
  );
}
