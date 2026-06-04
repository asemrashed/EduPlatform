import type { PublicBatchRow } from '@/services/publicBatchesService';

export function batchToCardProps(batch: PublicBatchRow) {
  const isFree = batch.fee <= 0;
  return {
    href: `/enroll/${batch._id}`,
    image: batch.thumbnailUrl || '',
    title: batch.name,
    description: batch.shortDescription || batch.description || '',
    price: isFree ? 'Free' : batch.fee.toLocaleString(),
    isFree,
    badge: `Grade ${batch.grade}`,
    badgeClass: 'bg-primary/90 text-on-primary',
    lessons: `${batch.enrolledCount}/${batch.maxStudents} seats`,
    actionLabel: 'View batch',
    imageFallback: 'Batch',
  };
}
