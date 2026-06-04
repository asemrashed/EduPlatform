'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { batchesService, type BatchRecord } from '@/services/batchesService';
import { LuPlus as Plus } from 'react-icons/lu';

export function BatchListClient({
  detailBasePath,
  allowCreate = false,
  requireInstructorId = false,
  emptyMessage = 'No batches found.',
}: {
  detailBasePath: string;
  allowCreate?: boolean;
  requireInstructorId?: boolean;
  emptyMessage?: string;
}) {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    instructorId: '',
    startDate: '',
    endDate: '',
    maxStudents: '30',
    fee: '0',
  });

  const load = async () => {
    setLoading(true);
    const res = await batchesService.listBatches();
    if (res.success && res.data) {
      setBatches(res.data.batches);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const res = await batchesService.createBatch({
      ...form,
      maxStudents: Number(form.maxStudents),
      fee: Number(form.fee),
      schedule: [],
    });
    if (res.success) {
      setShowForm(false);
      await load();
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Batches</h1>
        {allowCreate && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-1 h-4 w-4" />
            New batch
          </Button>
        )}
      </div>

      {showForm && allowCreate && (
        <Card>
          <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            {requireInstructorId && (
              <div className="sm:col-span-2">
                <Label>Instructor user ID</Label>
                <Input
                  value={form.instructorId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, instructorId: e.target.value }))
                  }
                  placeholder="MongoDB ObjectId of instructor"
                />
              </div>
            )}
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
            <div>
              <Label>Fee (BDT)</Label>
              <Input
                type="number"
                value={form.fee}
                onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={handleCreate}>Create batch</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid gap-3">
          {batches.map((b) => (
            <Card key={b._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.subject} · Fee {b.fee} BDT
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`${detailBasePath}/${b._id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
