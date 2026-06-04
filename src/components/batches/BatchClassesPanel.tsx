'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { batchesService, type BatchClassRecord } from '@/services/batchesService';

type CategoryOption = { _id: string; name: string };
type InstructorOption = { _id: string; label: string };

const emptyForm = {
  title: '',
  categoryId: '',
  instructorId: '',
};

export function BatchClassesPanel({
  batchId,
  canManage,
}: {
  batchId: string;
  canManage: boolean;
}) {
  const [classes, setClasses] = useState<BatchClassRecord[]>([]);
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
      setClasses(res.data.classes.filter((c) => c.isActive));
    } else {
      setError(res.error || 'Failed to load classes');
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
      setError(res.error || 'Failed to add class');
    }
  };

  const handleRemove = async (classId: string, title: string) => {
    if (!confirm(`Remove class "${title}"?`)) return;
    const res = await batchesService.deleteBatchClass(batchId, classId);
    if (res.success) load();
    else setError(res.error || 'Failed to remove class');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Batch classes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Subject classes in this batch (Math, Physics, etc.) — each has a category and instructor.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading classes…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes added yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {classes.map((c) => (
              <li
                key={c._id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-muted-foreground">
                    {c.categoryName || 'Category'} · {c.instructorName || 'Instructor'}
                  </p>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleRemove(c._id, c.title)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canManage && (
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Class title</Label>
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
              <Button
                disabled={saving || !form.title || !form.categoryId || !form.instructorId}
                onClick={handleCreate}
              >
                {saving ? 'Adding…' : '+ Add class'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
