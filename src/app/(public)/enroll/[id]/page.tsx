import type { Metadata } from 'next';
import { PublicEnrollDetailClient } from '@/components/enroll/PublicEnrollDetailClient';

export const metadata: Metadata = {
  title: 'Batch details',
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EnrollBatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PublicEnrollDetailClient batchId={id} />;
}
