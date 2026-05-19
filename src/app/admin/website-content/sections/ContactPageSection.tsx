'use client';

import type { WebsiteContent } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { defaultContactPageContent } from '@/lib/websiteContentDefaults';
import { LuPhone as Phone } from 'react-icons/lu';

interface ContactPageSectionProps {
  content: WebsiteContent;
  updateContent: (path: string[], value: unknown) => void;
}

export function ContactPageSection({ content, updateContent }: ContactPageSectionProps) {
  const page = {
    ...defaultContactPageContent,
    ...(content.contactPage ?? {}),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact Page
        </CardTitle>
        <CardDescription>
          Content shown on the public /contact page (headline, details, and optional map embed).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Headline</label>
          <AttractiveInput
            value={page.headline}
            onChange={(e) => updateContent(['contactPage', 'headline'], e.target.value)}
            placeholder="Get in Touch"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Subheadline</label>
          <AttractiveInput
            value={page.subheadline}
            onChange={(e) => updateContent(['contactPage', 'subheadline'], e.target.value)}
            placeholder="Short intro text"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Phone number</label>
          <Input
            value={page.phone}
            onChange={(e) => updateContent(['contactPage', 'phone'], e.target.value)}
            placeholder="+880 ..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Email address</label>
          <Input
            type="email"
            value={page.email}
            onChange={(e) => updateContent(['contactPage', 'email'], e.target.value)}
            placeholder="contact@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Address</label>
          <AttractiveInput
            value={page.address}
            onChange={(e) => updateContent(['contactPage', 'address'], e.target.value)}
            placeholder="Street, city"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Map embed URL</label>
          <Input
            value={page.mapEmbedUrl}
            onChange={(e) => updateContent(['contactPage', 'mapEmbedUrl'], e.target.value)}
            placeholder="https://www.google.com/maps/embed?..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
