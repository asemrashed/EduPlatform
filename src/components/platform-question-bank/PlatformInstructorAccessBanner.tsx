'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { platformQuestionsService } from '@/services/platformQuestionsService';
import { LuKey, LuClock } from 'react-icons/lu';

type AccessSummary = {
  hasActiveGrant: boolean;
  activeGrant?: { expiresAt?: string; grantedAt?: string } | null;
  pendingRequest?: { _id: string; createdAt?: string } | null;
};

interface Props {
  onAccessChanged: () => void;
}

export default function PlatformInstructorAccessBanner({ onAccessChanged }: Props) {
  const [summary, setSummary] = useState<AccessSummary | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await platformQuestionsService.listAccessRequests('limit=1');
    if (!res.ok) return;
    const json = await res.json();
    setSummary(json.data?.summary || null);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const requestAccess = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await platformQuestionsService.requestAccess({
        note: note.trim() || undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Could not submit request');
        return;
      }
      setNote('');
      await load();
      onAccessChanged();
    } finally {
      setBusy(false);
    }
  };

  if (!summary) return null;

  if (summary.hasActiveGrant && summary.activeGrant) {
    const exp = summary.activeGrant.expiresAt
      ? new Date(summary.activeGrant.expiresAt).toLocaleDateString()
      : null;
    return (
      <Card className="mb-4 flex items-start gap-3 border-green-200 bg-green-50/80 p-3 dark:border-green-900 dark:bg-green-950/30">
        <LuKey className="mt-0.5 shrink-0 text-green-700" size={18} />
        <div>
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Admin question bank access active
          </p>
          <p className="text-xs text-green-800/80 dark:text-green-200/80">
            You can browse admin platform questions{exp ? ` until ${exp}` : ''}. Editing is limited to your own questions.
          </p>
        </div>
      </Card>
    );
  }

  if (summary.pendingRequest) {
    return (
      <Card className="mb-4 flex items-start gap-3 border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900 dark:bg-amber-950/30">
        <LuClock className="mt-0.5 shrink-0 text-amber-700" size={18} />
        <div>
          <p className="text-sm font-medium">Access request pending</p>
          <p className="text-xs text-muted-foreground">
            An admin will review your request to use the admin platform question bank.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4 space-y-3 p-4">
      <div>
        <p className="text-sm font-medium">Request admin question bank access</p>
        <p className="text-xs text-muted-foreground">
          Browse (read-only) admin platform questions after approval. Your own questions are always available.
        </p>
      </div>
      <AttractiveTextarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note for admin..."
        rows={2}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button size="sm" disabled={busy} onClick={requestAccess}>
        Request access
      </Button>
    </Card>
  );
}
