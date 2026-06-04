'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FeaturesEditor } from '@/components/batches/FeaturesEditor';
import { BATCH_GRADES } from '@/lib/batchGrades';

export type BatchMarketingFormState = {
  name: string;
  grade: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  fee: string;
  startDate: string;
  endDate: string;
  maxStudents: string;
};

type Props = {
  form: BatchMarketingFormState;
  setForm: Dispatch<SetStateAction<BatchMarketingFormState>>;
  features: string[];
  onFeaturesChange: (features: string[]) => void;
  onCoverUpload: (file: File | null) => void;
  uploadingCover: boolean;
  showScheduleFields?: boolean;
  requireCore?: boolean;
};

export function BatchMarketingFormFields({
  form,
  setForm,
  features,
  onFeaturesChange,
  onCoverUpload,
  uploadingCover,
  showScheduleFields = false,
  requireCore = false,
}: Props) {
  const req = requireCore ? <span className="text-destructive"> *</span> : null;

  return (
    <>
      <div className="sm:col-span-2">
        <Label>Cover image{req}</Label>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploadingCover}
          onChange={(e) => onCoverUpload(e.target.files?.[0] ?? null)}
        />
        {form.thumbnailUrl ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{form.thumbnailUrl}</p>
        ) : null}
      </div>
      <div>
        <Label>Title{req}</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </div>
      <div>
        <Label>Grade{req}</Label>
        <select
          className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={form.grade}
          onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
        >
          {BATCH_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Price (BDT){req}</Label>
        <Input
          type="number"
          min={0}
          value={form.fee}
          onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Short description{req}</Label>
        <Input
          value={form.shortDescription}
          onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
          placeholder="Shown on card and hero (1–2 lines)"
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Preview video URL (optional)</Label>
        <Input
          value={form.videoUrl}
          onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
          placeholder="YouTube, Vimeo, or direct .mp4 link"
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Full description (optional)</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <FeaturesEditor features={features} onChange={onFeaturesChange} />
      {showScheduleFields && (
        <>
          <div>
            <Label>Start date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>End date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Max students</Label>
            <Input
              type="number"
              value={form.maxStudents}
              onChange={(e) => setForm((f) => ({ ...f, maxStudents: e.target.value }))}
            />
          </div>
        </>
      )}
    </>
  );
}
