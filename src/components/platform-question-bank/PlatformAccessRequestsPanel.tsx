'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { platformQuestionsService } from '@/services/platformQuestionsService';

type AccessRequestRow = {
  _id: string;
  requesterId: string;
  requesterName?: string;
  status: 'pending' | 'approved' | 'rejected';
  isPaid: boolean;
  amount?: number;
  grantedAt?: string;
  expiresAt?: string;
  note?: string;
  createdAt?: string;
};

export default function PlatformAccessRequestsPanel() {
  const [requests, setRequests] = useState<AccessRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [approveDays, setApproveDays] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await platformQuestionsService.listAccessRequests(params.toString());
      if (res.ok) {
        const json = await res.json();
        setRequests(json.data?.requests || []);
      } else {
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: string, status: 'approved' | 'rejected') => {
    setBusyId(id);
    try {
      const body: {
        status: 'approved' | 'rejected';
        expiresInDays?: number;
      } = { status };
      if (status === 'approved') {
        const days = Number.parseInt(approveDays[id] || '90', 10);
        if (Number.isFinite(days) && days > 0) body.expiresInDays = days;
      }
      const res = await platformQuestionsService.patchAccessRequest(id, body);
      if (res.ok) await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-2 p-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => load()}>
          Refresh
        </Button>
      </Card>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No access requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r._id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{r.requesterName || r.requesterId}</p>
                  <p className="text-xs text-muted-foreground">
                    Requested {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </p>
                  {r.note && <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>}
                  {r.isPaid && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Paid request{r.amount != null ? ` · ৳${r.amount}` : ''} (payment not wired)
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    r.status === 'approved'
                      ? 'default'
                      : r.status === 'rejected'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {r.status}
                </Badge>
              </div>
              {r.status === 'approved' && r.expiresAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Expires {new Date(r.expiresAt).toLocaleDateString()}
                </p>
              )}
              {r.status === 'pending' && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="text-xs text-muted-foreground">Grant days</label>
                  <Input
                    className="h-8 w-20"
                    type="number"
                    min={1}
                    value={approveDays[r._id] ?? '90'}
                    onChange={(e) =>
                      setApproveDays((prev) => ({ ...prev, [r._id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    disabled={busyId === r._id}
                    onClick={() => patch(r._id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === r._id}
                    onClick={() => patch(r._id, 'rejected')}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
