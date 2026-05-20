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
  defaultCertificatesContent,
  defaultPhotoGalleryContent,
} from '@/lib/websiteContentDefaults';
import {
  LuPlus as Plus, LuTrash2 as Trash,
  LuAward as Award, LuImage as ImageIcon,
} from 'react-icons/lu';

/** Hidden / future CMS sections — not shown on the public site. */
export type FutureSubTab = 'certificates' | 'photoGallery';

interface FutureSectionsProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
  activeSubTab: FutureSubTab;
  onSubTabChange: (tab: FutureSubTab) => void;
  subTabs?: FutureSubTab[];
  hideSubNav?: boolean;
}

const ALL_FUTURE_TABS: { id: FutureSubTab; label: string }[] = [
  { id: 'certificates', label: 'Certificates' },
  { id: 'photoGallery', label: 'Photo Gallery' },
];

export function FutureSections({
  content,
  updateContent,
  activeSubTab,
  onSubTabChange,
  subTabs,
  hideSubNav = false,
}: FutureSectionsProps) {
  const visibleTabs = ALL_FUTURE_TABS.filter((tab) => (subTabs ? subTabs.includes(tab.id) : true));
  const showSubNav = !hideSubNav && visibleTabs.length > 1;

  return (
    <>
      {showSubNav && (
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-6">
        {visibleTabs.map((tab) => (
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
      )}
      {(() => {
        switch (activeSubTab) {
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
          default:
            return null;
        }
      })()}
    </>
  );
}
