'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import PageSection from '@/components/dashboard/lp/PageSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { noticesService } from '@/services/noticesService';
import type { CreateNoticeDto, NoticeCategory } from '@/types/notice';
import { LuSend } from 'react-icons/lu';

type StaffRole = 'admin' | 'instructor';

export function NoticePostPanel({
  role,
  instructors = [],
  onPosted,
  compact = false,
}: {
  role: StaffRole;
  instructors?: Array<{ _id: string; name: string }>;
  onPosted?: () => void;
  compact?: boolean;
}) {
  const categories: NoticeCategory[] =
    role === 'admin' ? ['admin', 'subject', 'teacher'] : ['subject', 'teacher'];

  const [category, setCategory] = useState<NoticeCategory>(categories[0]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setBody('');
    setSubject('');
    setInstructorId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const payload: CreateNoticeDto = {
        title: title.trim(),
        body: body.trim(),
        category,
        ...(category === 'subject' ? { subject: subject.trim() } : {}),
        ...(category === 'teacher' && role === 'admin'
          ? { instructorId }
          : {}),
      };

      const { res, error: apiError } = await noticesService.create(payload);
      if (!res.ok) {
        setError(apiError || 'Failed to post notice');
        return;
      }
      reset();
      setSuccess('Notice posted.');
      onPosted?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection
      title="Post a notice"
      description={
        role === 'admin'
          ? 'Platform, subject, or teacher announcements'
          : 'Subject or teacher notices for your batches'
      }
      className={compact ? 'mt-4' : 'mt-2'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as NoticeCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'admin' ? 'Platform (admin)' : c === 'subject' ? 'Subject' : 'Teacher'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category === 'subject' ? (
            <AttractiveInput
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Physics"
              required
            />
          ) : null}
          {category === 'teacher' && role === 'admin' ? (
            <div>
              <label className="mb-1 block text-sm font-medium">Teacher</label>
              <Select value={instructorId} onValueChange={setInstructorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
        <AttractiveInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button type="submit" disabled={submitting}>
          <LuSend className="mr-2 h-4 w-4" />
          {submitting ? 'Posting…' : 'Post notice'}
        </Button>
      </form>
    </PageSection>
  );
}
