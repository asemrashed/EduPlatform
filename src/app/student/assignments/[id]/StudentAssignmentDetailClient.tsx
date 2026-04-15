'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import PageSection from '@/components/PageSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WelcomeSection from '@/components/WelcomeSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { LuFileText as LuFileText, LuUpload as Upload, LuCalendar as Calendar, LuClock as Clock, LuSend as Send, LuTriangleAlert as AlertCircle, LuCheck as CheckCircle2, LuLink as LuLinkIcon } from 'react-icons/lu';;
import { Assignment } from '@/types/assignment';
import { htmlToPlainText } from '@/lib/utils';

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments/${assignmentId}`);
      const data = await res.json();
      if (res.ok) {
        setAssignment(data.data?.assignment || data.assignment);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async () => {
    if (!assignment) return;
    setError(null);

    // basic validation – require content for essay/project/presentation; allow empty for quiz link (handled elsewhere)
    if (!content.trim()) {
      setError('Please provide your answer (URL or text) before submitting.');
      return;
    }
    try {
      setSubmitting(true);
      let res: Response;
      if (assignment.type === 'file_upload') {
        let filesPayload: any[] | undefined = undefined;
        if (file) {
          const uploadForm = new FormData();
          uploadForm.append('files', file);
          const uploadRes = await fetch('/api/uploads/assignment', {
            method: 'POST',
            body: uploadForm,
          });
          const uploadJson = await uploadRes.json();
          if (!uploadRes.ok) {
            setError(uploadJson?.error || 'File upload failed');
            return;
          }
          filesPayload = uploadJson.files;
        }
        const body: any = { content: content.trim() };
        if (filesPayload && filesPayload.length > 0) body.files = filesPayload;
        res = await fetch(`/api/student/assignments/${assignment._id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      } else {
        const body: any = { content: content.trim() };
        res = await fetch(`/api/student/assignments/${assignment._id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (res.ok) {
        // Navigate reliably back to the student assignments list
        router.replace('/student/assignments');
      } else {
        setError(data?.error || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection title="Submit Assignment" description="Provide your response and any required attachments" />
        {loading || !assignment ? (
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-6 w-1/3 rounded mb-4" />
              <div className="bg-gray-200 h-4 w-2/3 rounded" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuFileText className="w-5 h-5 text-blue-600" />
                {assignment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Back to list */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.replace('/student/assignments')}
                  className="mb-2"
                >
                  Back to Assignments
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-semibold text-gray-900">{(assignment as any)?.course?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Marks</p>
                  <p className="font-semibold text-gray-900">{assignment.totalMarks}</p>
                </div>
              </div>

              {/* Status & time left */}
              <div className="flex flex-wrap items-center gap-3">
                {(() => {
                  const now = new Date();
                  const start = assignment.startDate ? new Date(assignment.startDate) : null;
                  const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
                  let label = 'Active';
                  let cls = 'bg-green-100 text-green-800';
                  if (start && start > now) { label = 'Upcoming'; cls = 'bg-yellow-100 text-yellow-800'; }
                  else if (due && due < now) { label = 'Overdue'; cls = 'bg-red-100 text-red-800'; }
                  return <Badge variant="secondary" className={cls}>{label}</Badge>;
                })()}
                {assignment.dueDate && (
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {(() => {
                      const now = new Date().getTime();
                      const due = new Date(assignment.dueDate as any).getTime();
                      const diff = due - now;
                      if (diff <= 0) return 'Past due';
                      const d = Math.floor(diff / (1000*60*60*24));
                      const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
                      const m = Math.floor((diff % (1000*60*60)) / (1000*60));
                      return `${d}d ${h}h ${m}m remaining`;
                    })()}
                  </div>
                )}
              </div>

              {assignment.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900">{htmlToPlainText(assignment.description)}</p>
                </div>
              )}

              {/* Submission form */}
              <div className="space-y-4">
                {assignment.type === 'project' || assignment.type === 'presentation' ? (
                  <AttractiveInput
                    type="url"
                    label="Submission URL"
                    placeholder="Paste your project/presentation link (e.g., GitHub, Google Slides)"
                    icon="tag"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                ) : (
                  <AttractiveTextarea
                    label={assignment.type === 'essay' ? 'Your Essay' : 'Your Answer'}
                    placeholder={assignment.type === 'essay' ? 'Write your essay here...' : 'Write your response here...'}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                  />
                )}

                {assignment.type === 'file_upload' && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-purple-600" />
                      Attachment (optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">You can still submit without attaching a file. Max ~10MB.</p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </StudentRoleShell>
  );
}

