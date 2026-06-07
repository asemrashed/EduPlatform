'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { batchesService, type BatchClassRecord } from '@/services/batchesService';
import { LuBookOpen as BookOpen, LuPencil as Pencil, LuTrash2 as Trash2 } from 'react-icons/lu';

type CategoryOption = { _id: string; name: string };
type InstructorOption = { _id: string; label: string };

const emptyForm = {
  title: '',
  categoryId: '',
  instructorId: '',
};

export function BatchSubjectsPanel({
  batchId,
  canManage,
  subjectBasePath,
  studentSubjectBasePath,
}: {
  batchId: string;
  canManage: boolean;
  /** e.g. /admin/batches/[id]/subjects */
  subjectBasePath: string;
  /** e.g. /student/batches/[id]/subjects — used when student enters a subject */
  studentSubjectBasePath?: string;
}) {
  const [subjects, setSubjects] = useState<BatchClassRecord[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await batchesService.listBatchClasses(batchId);
    if (res.success && res.data) {
      const list = res.data.subjects ?? res.data.classes ?? [];
      setSubjects(list.filter((c) => c.isActive));
    } else {
      setError(res.error || 'Failed to load subjects');
    }
    setLoading(false);
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canManage) return;
    const loadMeta = async () => {
      try {
        const [catRes, teachRes] = await Promise.all([
          fetch('/api/categories?limit=200', { credentials: 'include' }),
          fetch('/api/teachers?limit=500', { credentials: 'include' }),
        ]);
        const catData = await catRes.json();
        const teachData = await teachRes.json();
        const cats = Array.isArray(catData?.categories)
          ? catData.categories
          : Array.isArray(catData?.data?.categories)
            ? catData.data.categories
            : [];
        setCategories(
          cats
            .filter((c: { isActive?: boolean }) => c.isActive !== false)
            .map((c: { _id: string; name: string }) => ({
              _id: String(c._id),
              name: String(c.name),
            })),
        );
        const teachers = Array.isArray(teachData?.teachers) ? teachData.teachers : [];
        setInstructors(
          teachers.map((t: Record<string, unknown>) => {
            const name =
              String(t.fullName || '').trim() ||
              [t.firstName, t.lastName].filter(Boolean).join(' ').trim() ||
              String(t.email || 'Instructor');
            return { _id: String(t._id), label: name };
          }),
        );
      } catch {
        setCategories([]);
        setInstructors([]);
      }
    };
    loadMeta();
  }, [canManage]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.categoryId || !form.instructorId) return;
    setSaving(true);
    setError(null);
    const res = await batchesService.createBatchClass(batchId, {
      title: form.title.trim(),
      categoryId: form.categoryId,
      instructorId: form.instructorId,
    });
    setSaving(false);
    if (res.success) {
      setForm(emptyForm);
      load();
    } else {
      setError(res.error || 'Failed to add subject');
    }
  };

  const handleRemove = async (subjectId: string, title: string) => {
    if (!confirm(`Remove subject "${title}"?`)) return;
    const res = await batchesService.deleteBatchClass(batchId, subjectId);
    if (res.success) load();
    else setError(res.error || 'Failed to remove subject');
  };

  const enterHref = (subjectId: string) => {
    if (canManage) return `${subjectBasePath}/${subjectId}`;
    return studentSubjectBasePath
      ? `${studentSubjectBasePath}/${subjectId}`
      : `${subjectBasePath}/${subjectId}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subjects</CardTitle>
        <p className="text-sm text-muted-foreground">
          Subject areas in this batch (Math, Physics, etc.) — each has modules and lessons.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading subjects…</p>
        ) : subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects added yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {subjects.map((s) => (
              <li
                key={s._id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={enterHref(s._id)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                  <p className="text-muted-foreground">
                    {s.categoryName || 'Category'} · {s.instructorName || 'Instructor'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={enterHref(s._id)}>
                      <BookOpen className="mr-1 h-4 w-4" />
                      {canManage ? 'Manage curriculum' : 'Enter subject'}
                    </Link>
                  </Button>
                  {canManage && (
                    <>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={enterHref(s._id)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemove(s._id, s.title)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {canManage && (
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Subject title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Physics — Mechanics"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Instructor</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.instructorId}
                onChange={(e) => setForm((f) => ({ ...f, instructorId: e.target.value }))}
              >
                <option value="">Select instructor</option>
                {instructors.map((ins) => (
                  <option key={ins._id} value={ins._id}>
                    {ins.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button disabled={saving} onClick={handleCreate}>
                {saving ? 'Adding…' : 'Add subject'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
