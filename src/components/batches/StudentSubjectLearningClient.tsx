'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleHeader } from '@/components/ui/collapsible';
import {
  subjectCurriculumService,
  type SubjectLessonRecord,
  type SubjectModuleWithLessons,
} from '@/services/subjectCurriculumService';
import type { BatchClassRecord } from '@/services/batchesService';
import { getYoutubeEmbedUrl } from '@/lib/youtube';
import { confirmJoinLive } from '@/lib/swal';
import {
  LuArrowLeft as ArrowLeft,
  LuArrowRight as ArrowRight,
  LuClock as Clock,
  LuExternalLink as ExternalLink,
  LuListVideo as ListVideo,
  LuRadio as Radio,
  LuVideo as Video,
} from 'react-icons/lu';

type LivePhase = 'waiting' | 'live' | 'ended';

function getLivePhase(lesson: SubjectLessonRecord, now: number): LivePhase {
  if (!lesson.scheduledAt) return 'live';
  const start = new Date(lesson.scheduledAt).getTime();
  const durationMs = (lesson.durationMinutes ?? 60) * 60 * 1000;
  const end = start + durationMs;
  if (now < start) return 'waiting';
  if (now <= end) return 'live';
  return 'ended';
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function LiveLessonPanel({
  lesson,
  onJoin,
}: {
  lesson: SubjectLessonRecord;
  onJoin: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const phase = getLivePhase(lesson, now);
  const startMs = lesson.scheduledAt ? new Date(lesson.scheduledAt).getTime() : now;
  const remaining = Math.max(0, startMs - now);

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center text-white shadow-lg">
      <Radio className="mb-4 h-12 w-12 text-red-400" />
      <h3 className="text-lg font-semibold">{lesson.title}</h3>
      <p className="mt-1 text-sm text-slate-300">Live class</p>

      {phase === 'waiting' && (
        <>
          <p className="mt-6 text-sm text-slate-400">Class starts in</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-wider text-white">
            {formatCountdown(remaining)}
          </p>
          {lesson.scheduledAt && (
            <p className="mt-4 text-sm text-slate-400">
              {new Date(lesson.scheduledAt).toLocaleString()}
            </p>
          )}
        </>
      )}

      {phase === 'live' && (
        <>
          <p className="mt-6 text-sm text-green-400">Class is live now</p>
          <Button
            size="lg"
            className="mt-6 bg-red-600 hover:bg-red-700"
            onClick={onJoin}
            disabled={!lesson.meetLink}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Join live class
          </Button>
          {!lesson.meetLink && (
            <p className="mt-3 text-sm text-amber-400">Meet link not available yet.</p>
          )}
        </>
      )}

      {phase === 'ended' && (
        <>
          <p className="mt-6 text-sm text-slate-400">This live class has ended.</p>
          {!(lesson.recordingUrl || lesson.youtubeVideoId || lesson.videoUrl) && (
            <p className="mt-2 text-sm text-slate-300">
              Recording not uploaded yet — check back later.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function RecordedLessonPlayer({ lesson }: { lesson: SubjectLessonRecord }) {
  const embedUrl = lesson.youtubeVideoId
    ? getYoutubeEmbedUrl(lesson.youtubeVideoId)
    : null;
  const directUrl = lesson.recordingUrl || lesson.videoUrl;

  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-lg">
        <iframe src={embedUrl} className="h-full w-full" allowFullScreen title={lesson.title} />
      </div>
    );
  }

  if (directUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-black shadow-lg">
        <video src={directUrl} controls className="h-full w-full" title={lesson.title}>
          Your browser does not support video playback.
        </video>
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-muted-foreground">
      No recording available yet.
    </div>
  );
}

export function StudentSubjectLearningClient({
  batchId,
  subjectId,
  backHref,
}: {
  batchId: string;
  subjectId: string;
  backHref: string;
}) {
  const [subject, setSubject] = useState<BatchClassRecord | null>(null);
  const [modules, setModules] = useState<SubjectModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const now = useNow();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await subjectCurriculumService.getCurriculum(batchId, subjectId);
    if (res.success && res.data) {
      setSubject(res.data.subject);
      setModules(res.data.modules);
      const allLessons = res.data.modules.flatMap((m) => m.lessons);
      setSelectedLessonId((prev) => {
        if (prev && allLessons.some((l) => l._id === prev)) return prev;
        return allLessons[0]?._id ?? null;
      });
    } else {
      setError(res.error || 'Failed to load subject');
    }
    setLoading(false);
  }, [batchId, subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const allLessonsOrdered = useMemo(
    () => modules.flatMap((m) => m.lessons),
    [modules],
  );

  const selectedLesson = useMemo(
    () => allLessonsOrdered.find((l) => l._id === selectedLessonId) ?? null,
    [allLessonsOrdered, selectedLessonId],
  );

  const currentIndex = selectedLesson
    ? allLessonsOrdered.findIndex((l) => l._id === selectedLesson._id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedLessonId(allLessonsOrdered[currentIndex - 1]._id);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < allLessonsOrdered.length - 1) {
      setSelectedLessonId(allLessonsOrdered[currentIndex + 1]._id);
    }
  };

  const handleJoinLive = async () => {
    if (!selectedLesson?.meetLink) return;
    const ok = await confirmJoinLive(selectedLesson.title);
    if (ok) {
      window.open(selectedLesson.meetLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading subject…</p>;
  }

  if (error && !subject) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={backHref}>Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to batch
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{subject?.title}</h1>
            <p className="text-sm text-muted-foreground">
              {subject?.instructorName} · {subject?.categoryName}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[1fr_340px] md:p-6">
        {/* Left — video / live player */}
        <main className="min-w-0">
          {!selectedLesson ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select a lesson from the playlist to begin.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                {selectedLesson.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedLesson.description}
                  </p>
                )}
                {selectedLesson.type === 'live' && selectedLesson.scheduledAt && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(selectedLesson.scheduledAt).toLocaleString()}
                    {selectedLesson.durationMinutes
                      ? ` · ${selectedLesson.durationMinutes} min`
                      : ''}
                  </p>
                )}
              </div>

              {selectedLesson.type === 'live' ? (
                <>
                  <LiveLessonPanel lesson={selectedLesson} onJoin={handleJoinLive} />
                  {getLivePhase(selectedLesson, now) === 'ended' &&
                    (selectedLesson.recordingUrl ||
                      selectedLesson.youtubeVideoId ||
                      selectedLesson.videoUrl) && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Class recording
                        </p>
                        <RecordedLessonPlayer lesson={selectedLesson} />
                      </div>
                    )}
                </>
              ) : (
                <RecordedLessonPlayer lesson={selectedLesson} />
              )}

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex <= 0}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex >= 0
                    ? `${currentIndex + 1} / ${allLessonsOrdered.length}`
                    : '—'}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={
                    currentIndex < 0 || currentIndex >= allLessonsOrdered.length - 1
                  }
                >
                  Next
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Right — playlist */}
        <aside className="min-w-0">
          <div className="sticky top-4 rounded-lg border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <ListVideo className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Playlist</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                {allLessonsOrdered.length} lesson
                {allLessonsOrdered.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-3">
              {modules.length === 0 ? (
                <p className="px-2 py-4 text-sm text-muted-foreground">
                  No content published yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod) => (
                    <Collapsible key={mod._id} defaultOpen>
                      <CollapsibleHeader className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium">
                        {mod.title}
                      </CollapsibleHeader>
                      <CollapsibleContent className="mt-1 space-y-0.5">
                        {mod.lessons.map((lesson) => {
                          const globalIdx = allLessonsOrdered.findIndex(
                            (l) => l._id === lesson._id,
                          );
                          return (
                            <button
                              key={lesson._id}
                              type="button"
                              onClick={() => setSelectedLessonId(lesson._id)}
                              className={`flex w-full items-start gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                                selectedLessonId === lesson._id
                                  ? 'bg-primary/10 font-medium text-primary ring-1 ring-primary/20'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <span className="mt-0.5 shrink-0 text-xs tabular-nums text-muted-foreground">
                                {globalIdx + 1}.
                              </span>
                              {lesson.type === 'live' ? (
                                <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                              ) : (
                                <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-2">{lesson.title}</span>
                                <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                                  {lesson.type === 'live' ? 'Live class' : 'Recorded'}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                        {mod.lessons.length === 0 && (
                          <p className="px-3 py-2 text-xs text-muted-foreground">No lessons</p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
