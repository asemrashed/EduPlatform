import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PublicEnrollClient } from '@/components/enroll/PublicEnrollClient';

export const metadata: Metadata = {
  title: 'Batch Enrollment',
  description: 'Register for live academic batches',
};

export default function EnrollPage() {
  return (
    <Suspense fallback={<p className="px-4 py-10 text-muted-foreground">Loading…</p>}>
      <PublicEnrollClient />
    </Suspense>
  );
}
