'use client';

import { LuCircleCheck } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { toEmbedVideoUrl } from '@/lib/videoEmbed';
import type { PublicBatchRow } from '@/services/publicBatchesService';

export function BatchEnrollSidebar({
  batch,
  enrolled,
  registering,
  error,
  onEnroll,
}: {
  batch: PublicBatchRow;
  enrolled: boolean;
  registering: boolean;
  error: string | null;
  onEnroll: () => void;
}) {
  const embedUrl = toEmbedVideoUrl(batch.videoUrl);
  const isFree = batch.fee <= 0;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-xl border bg-card shadow-lg">
        {embedUrl ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              src={embedUrl}
              title="Batch preview"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : batch.thumbnailUrl ? (
          <div
            className="aspect-video w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${batch.thumbnailUrl})` }}
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-slate-900 text-sm text-white/60">
            No preview video
          </div>
        )}

        <div className="space-y-4 p-5">
          <div>
            {isFree ? (
              <p className="text-3xl font-black text-primary">Free</p>
            ) : (
              <p className="text-3xl font-black text-primary">
                <span className="text-2xl">৳</span>
                {batch.fee.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {batch.seatsRemaining > 0
                ? `${batch.seatsRemaining} seats left`
                : batch.isFull
                  ? 'Batch is full'
                  : 'Limited seats'}
            </p>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {error}
            </p>
          )}

          {enrolled ? (
            <Button className="w-full" asChild>
              <a href={`/student/batches/${batch._id}`}>Go to my batch</a>
            </Button>
          ) : (
            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              size="lg"
              disabled={batch.isFull || registering}
              onClick={onEnroll}
            >
              {registering
                ? 'Processing…'
                : batch.isFull
                  ? 'Batch full'
                  : isFree
                    ? 'Enroll now'
                    : 'Enroll & pay'}
            </Button>
          )}

          {batch.features.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-bold">What&apos;s included</h3>
              <ul className="space-y-2">
                {batch.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <LuCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
