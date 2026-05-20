'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CmsImageFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
  previewAlt?: string;
}

export function CmsImageField({
  label = 'Image',
  value,
  onChange,
  placeholder = 'https://...',
  hint,
  previewAlt = 'Preview',
}: CmsImageFieldProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload/cms-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data?.imageUrl) {
        throw new Error(data?.error || 'Failed to upload image');
      }
      onChange(data.imageUrl);
    } catch (error) {
      console.error('CMS image upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">{label}</label>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="max-w-xs"
        />
        {uploading ? <span className="text-xs text-gray-500">Uploading…</span> : null}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      {value ? (
        <div className="relative mt-1 h-24 w-full max-w-xs overflow-hidden rounded-lg border bg-gray-50">
          <Image src={value} alt={previewAlt} fill className="object-contain p-1" />
        </div>
      ) : null}
      {value ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange('')}>
          Remove image
        </Button>
      ) : null}
    </div>
  );
}
