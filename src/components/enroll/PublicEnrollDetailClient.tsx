'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LuCircleCheck } from 'react-icons/lu';
import {
  getMyBatchEnrollments,
  initiateBatchPayment,
  registerForBatch,
  type BatchEnrollmentRow,
} from '@/lib/api/batchEnrollmentClient';
import { BatchEnrollSidebar } from '@/components/enroll/BatchEnrollSidebar';
import {
  publicBatchesService,
  type PublicBatchRow,
  type PublicBatchRoutineDay,
} from '@/services/publicBatchesService';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function isPaidActive(row: BatchEnrollmentRow) {
  return row.paymentStatus === 'paid' && row.status === 'active';
}

export function PublicEnrollDetailClient({ batchId }: { batchId: string }) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [batch, setBatch] = useState<PublicBatchRow | null>(null);
  const [routine, setRoutine] = useState<PublicBatchRoutineDay[]>([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await publicBatchesService.getBatch(batchId);
    if (res.success && res.data) {
      setBatch(res.data.batch);
      setRoutine(res.data.routine ?? []);
    } else {
      setError(res.error || 'Batch not found');
      setBatch(null);
    }
    setLoading(false);
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') {
      setEnrolled(false);
      return;
    }
    getMyBatchEnrollments()
      .then((res) => {
        const hit = (res.data?.enrollments ?? []).some(
          (e) => String(e.batchId) === batchId && isPaidActive(e),
        );
        setEnrolled(hit);
      })
      .catch(() => setEnrolled(false));
  }, [sessionStatus, batchId]);

  const handleRegister = async () => {
    if (!batch) return;
    setError(null);

    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/enroll/${batchId}`)}`);
      return;
    }
    if (session.user.role !== 'student') {
      setError('Only student accounts can register for batches.');
      return;
    }
    if (batch.isFull) {
      setError('This batch is full.');
      return;
    }
    if (enrolled) {
      router.push(`/student/batches/${batchId}`);
      return;
    }

    setRegistering(true);
    try {
      const reg = await registerForBatch(batchId);
      if (reg.data?.requiresPayment) {
        const pay = await initiateBatchPayment(batchId);
        if (pay.data?.checkout_url) {
          window.location.href = pay.data.checkout_url;
          return;
        }
        if (pay.data?.enrolled) {
          router.push(`/student/batches/${batchId}`);
          return;
        }
        throw new Error('No checkout URL returned');
      }
      router.push(`/student/batches/${batchId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.toLowerCase().includes('already enrolled')) {
        router.push(`/student/batches/${batchId}`);
        return;
      }
      setError(msg);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <p className="px-4 py-16 text-center text-muted-foreground">Loading…</p>;
  }

  if (!batch) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-16 text-center">
        <p className="text-destructive">{error || 'Batch not available.'}</p>
        <Button asChild variant="outline">
          <Link href="/enroll">Back to batches</Link>
        </Button>
      </div>
    );
  }

  const routineRows = routine.flatMap((day) =>
    day.slots.map((slot) => ({
      day: day.label,
      time: `${slot.startTime} – ${slot.endTime}`,
      title: slot.title || 'Session',
    })),
  );

  const highlightFeatures = batch.features.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-14 text-white md:px-8">
        <div className="mx-auto max-w-6xl">
          <Button asChild variant="ghost" size="sm" className="mb-4 text-white/80 hover:text-white">
            <Link href="/enroll">← All batches</Link>
          </Button>
          <p className="text-sm font-medium uppercase tracking-wider text-emerald-400">
            Grade {batch.grade}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
            {batch.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">{batch.shortDescription}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          {highlightFeatures.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold">Why this batch</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlightFeatures.map((text, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <LuCircleCheck className="mb-2 h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-xl font-bold">Instructor</h2>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                {batch.instructorAvatar ? (
                  <Image
                    src={batch.instructorAvatar}
                    alt={batch.instructorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg font-bold text-muted-foreground">
                    {batch.instructorName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{batch.instructorName}</p>
                <p className="text-sm text-muted-foreground">{batch.subject}</p>
              </div>
            </div>
          </section>

          {batch.description && (
            <section>
              <h2 className="mb-3 text-xl font-bold">About this batch</h2>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {batch.description}
              </p>
            </section>
          )}

          {routineRows.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-bold">Class routine</h2>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="p-3 font-semibold">Day</th>
                      <th className="p-3 font-semibold">Time</th>
                      <th className="p-3 font-semibold">Topic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routineRows.map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3">{row.day}</td>
                        <td className="p-3">{row.time}</td>
                        <td className="p-3">{row.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="text-sm text-muted-foreground">
            <p>
              Duration: {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
            </p>
            <p>
              Enrollment: {batch.enrolledCount} / {batch.maxStudents} students
            </p>
          </section>
        </div>

        <BatchEnrollSidebar
          batch={batch}
          enrolled={enrolled}
          registering={registering}
          error={error}
          onEnroll={handleRegister}
        />
      </div>
    </div>
  );
}
