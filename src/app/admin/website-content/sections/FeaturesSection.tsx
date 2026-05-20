'use client';

import type { WebsiteContent } from './types';
import { defaultWhyChooseUsContent } from '@/lib/websiteContentDefaults';
import type { WhyChooseUsFeature } from '@/lib/websiteContentTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { CmsImageField } from './CmsImageField';
import { LuPlus as Plus, LuTrash2 as Trash, LuStar as Star } from 'react-icons/lu';

interface FeaturesSectionProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
}

const ICON_TYPES: WhyChooseUsFeature['iconType'][] = [
  'flexible',
  'instructor',
  'community',
  'money',
];

export function FeaturesSection({ content, updateContent }: FeaturesSectionProps) {
  const section = {
    ...defaultWhyChooseUsContent,
    ...(content.whyChooseUs ?? {}),
  };
  const features =
    section.features?.length > 0 ? section.features : defaultWhyChooseUsContent.features;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Features
        </CardTitle>
        <CardDescription>
          Shared home page features section (also used on the About page).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SectionIntroFields
          sectionHeading={section.sectionHeading ?? ''}
          sectionSubtitle={section.sectionSubtitle ?? ''}
          onHeadingChange={(v) => updateContent(['whyChooseUs', 'sectionHeading'], v)}
          onSubtitleChange={(v) => updateContent(['whyChooseUs', 'sectionSubtitle'], v)}
        />
        <CmsImageField
          label="Section image (home page)"
          value={section.image ?? ''}
          onChange={(url) => updateContent(['whyChooseUs', 'image'], url)}
          hint="Shown beside the feature list on the home page."
          previewAlt="Features section"
        />
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Feature items</label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const maxId = features.length
                ? Math.max(...features.map((f) => f.id))
                : 0;
              updateContent(
                ['whyChooseUs', 'features'],
                [
                  ...features,
                  {
                    id: maxId + 1,
                    title: '',
                    titleBn: '',
                    description: '',
                    descriptionBn: '',
                    iconType: 'flexible',
                  },
                ],
              );
            }}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add feature
          </Button>
        </div>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <FeatureItemEditor
              key={feature.id ?? index}
              feature={feature}
              index={index}
              onUpdate={(updated) => {
                const next = [...features];
                next[index] = updated;
                updateContent(['whyChooseUs', 'features'], next);
              }}
              onRemove={() => {
                updateContent(
                  ['whyChooseUs', 'features'],
                  features.filter((_, i) => i !== index),
                );
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionIntroFields({
  sectionHeading,
  sectionSubtitle,
  onHeadingChange,
  onSubtitleChange,
}: {
  sectionHeading: string;
  sectionSubtitle: string;
  onHeadingChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
}) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-semibold">Section heading</label>
        <AttractiveInput
          value={sectionHeading}
          onChange={(e) => onHeadingChange(e.target.value)}
          placeholder="Why Choose EduPlatform"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold">Section subtitle</label>
        <AttractiveInput
          value={sectionSubtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Everything you need to succeed"
        />
      </div>
    </>
  );
}

function FeatureItemEditor({
  feature,
  index,
  onUpdate,
  onRemove,
}: {
  feature: WhyChooseUsFeature;
  index: number;
  onUpdate: (f: WhyChooseUsFeature) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Feature {index + 1}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="text-red-600"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Icon</label>
        <select
          value={feature.iconType}
          onChange={(e) =>
            onUpdate({
              ...feature,
              iconType: e.target.value as WhyChooseUsFeature['iconType'],
            })
          }
          className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
        >
          {ICON_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Heading</label>
        <Input
          value={feature.title}
          onChange={(e) =>
            onUpdate({ ...feature, title: e.target.value, titleBn: e.target.value })
          }
          placeholder="Feature title"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea
          value={feature.description}
          onChange={(e) =>
            onUpdate({
              ...feature,
              description: e.target.value,
              descriptionBn: e.target.value,
            })
          }
          placeholder="Feature description"
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
        />
      </div>
    </div>
  );
}
