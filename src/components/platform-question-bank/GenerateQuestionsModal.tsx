'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { platformQuestionsService } from '@/services/platformQuestionsService';
import type { GeneratedQuestionDraft } from '@/services/platformQuestionsService';
import { LuSparkles, LuSave, LuFileText, LuUpload } from 'react-icons/lu';

type BankRole = 'admin' | 'instructor';
type InputMode = 'paste' | 'pdf';

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

interface Props {
  open: boolean;
  role: BankRole;
  defaultSubject?: string | null;
  defaultTopic?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateQuestionsModal({
  open,
  defaultSubject,
  defaultTopic,
  onClose,
  onSuccess,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [inputMode, setInputMode] = useState<InputMode>('paste');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPublicId, setPdfPublicId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [preview, setPreview] = useState<GeneratedQuestionDraft[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyMissing, setKeyMissing] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject || '');
      setTopic(defaultTopic || '');
    }
  }, [open, defaultSubject, defaultTopic]);

  const reset = () => {
    setInputMode('paste');
    setStep('input');
    setText('');
    setSubject(defaultSubject || '');
    setTopic(defaultTopic || '');
    setPdfFile(null);
    setPdfPublicId(null);
    setPdfUrl(null);
    setPreview([]);
    setSelected(new Set());
    setError('');
    setKeyMissing(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const uploadPdfIfNeeded = async (): Promise<string | null> => {
    if (inputMode !== 'pdf') return null;
    if (pdfPublicId) return pdfPublicId;
    if (!pdfFile) {
      setError('Choose a PDF file first');
      return null;
    }
    setUploadingPdf(true);
    try {
      const res = await platformQuestionsService.uploadPdf(pdfFile);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.pdf?.publicId) {
        setError(json.error || 'PDF upload failed');
        return null;
      }
      setPdfPublicId(json.pdf.publicId);
      setPdfUrl(json.pdf.url || null);
      return json.pdf.publicId as string;
    } finally {
      setUploadingPdf(false);
    }
  };

  const runGenerate = async () => {
    setError('');
    setKeyMissing(false);
    setLoading(true);
    try {
      const hints = {
        subject: subject.trim() || undefined,
        topic: topic.trim() || undefined,
      };

      let res: Response;
      if (inputMode === 'pdf') {
        const publicId = await uploadPdfIfNeeded();
        if (!publicId) return;
        res = await platformQuestionsService.generateFromPdf({
          pdfPublicId: publicId,
          ...hints,
        });
      } else {
        res = await platformQuestionsService.generateFromText({
          text,
          ...hints,
        });
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.code === 'ANTHROPIC_API_KEY_MISSING') setKeyMissing(true);
        setError(json.error || 'Generation failed');
        return;
      }
      const questions: GeneratedQuestionDraft[] = json.data?.questions || [];
      if (json.data?.source?.type === 'pdf') {
        setPdfPublicId(json.data.source.pdfPublicId || pdfPublicId);
        setPdfUrl(json.data.source.pdfUrl || pdfUrl);
        setInputMode('pdf');
      }
      setPreview(questions);
      setSelected(new Set(questions.map((_, i) => i)));
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const saveBatch = async () => {
    const toSave = preview.filter((_, i) => selected.has(i));
    if (!toSave.length) {
      setError('Select at least one question to save');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await platformQuestionsService.saveGeneratedBatch({
        questions: toSave,
        subject: subject.trim() || undefined,
        topic: topic.trim() || undefined,
        sourceType: pdfPublicId ? 'pdf' : 'claude',
        sourcePdfPublicId: pdfPublicId || undefined,
        sourcePdfUrl: pdfUrl || undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Save failed');
        return;
      }
      handleClose();
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const toggleIndex = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const canGenerate =
    inputMode === 'paste'
      ? text.trim().length >= 50
      : Boolean(pdfFile || pdfPublicId);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Generate questions with AI"
      description="Paste text or upload a PDF — Claude extracts MCQs for preview and batch save"
      size="2xl"
      footer={
        step === 'input' ? (
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading || uploadingPdf || !canGenerate} onClick={runGenerate}>
              <LuSparkles className="mr-1" size={16} />
              {loading || uploadingPdf ? 'Working...' : 'Generate preview'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep('input')}>
              Back
            </Button>
            <Button disabled={loading || selected.size === 0} onClick={saveBatch}>
              <LuSave className="mr-1" size={16} />
              {loading ? 'Saving...' : `Save ${selected.size} question(s)`}
            </Button>
          </>
        )
      }
    >
      {keyMissing && (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          ANTHROPIC_API_KEY is not set. Add it to <code className="text-xs">.env.local</code> (see{' '}
          <code className="text-xs">.env.example</code>) and restart the dev server.
        </p>
      )}
      {error && !keyMissing && (
        <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {step === 'input' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={inputMode === 'paste' ? 'default' : 'outline'}
              onClick={() => setInputMode('paste')}
            >
              <LuFileText className="mr-1" size={14} />
              Paste text
            </Button>
            <Button
              type="button"
              size="sm"
              variant={inputMode === 'pdf' ? 'default' : 'outline'}
              onClick={() => setInputMode('pdf')}
            >
              <LuUpload className="mr-1" size={14} />
              Upload PDF
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Default subject (optional)</label>
              <AttractiveInput
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Default topic (optional)</label>
              <AttractiveInput
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Mechanics"
              />
            </div>
          </div>

          {inputMode === 'paste' ? (
            <div>
              <label className="mb-1 block text-sm font-medium">Source text</label>
              <AttractiveTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste chapter notes, past paper extract, or question bank text..."
                rows={12}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Minimum 50 characters. {text.trim().length} entered.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4">
              <label className="mb-2 block text-sm font-medium">PDF file (max 10MB)</label>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                className="block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPdfFile(f || null);
                  setPdfPublicId(null);
                  setPdfUrl(null);
                  setError('');
                }}
              />
              {pdfFile && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)
                  {pdfPublicId ? ' — uploaded' : ''}
                </p>
              )}
              {pdfUrl && (
                <p className="mt-1 text-xs">
                  Source:{' '}
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                    view PDF
                  </a>
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Uses <code className="text-[10px]">POST /api/upload/pdf</code> then extracts text server-side for Claude.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="scrollbar-hide max-h-[55vh] space-y-3 overflow-y-auto pr-1">
          <p className="text-sm text-muted-foreground">
            {preview.length} question(s) extracted
            {pdfPublicId ? ' from PDF' : ''} — uncheck any you do not want to save.
          </p>
          {preview.map((q, i) => (
            <div key={i} className="flex gap-2 rounded-lg border p-3">
              <Checkbox
                className="mt-1"
                checked={selected.has(i)}
                onCheckedChange={() => toggleIndex(i)}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{q.questionText}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {q.subject} · {q.topic}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {DIFFICULTY_LABEL[q.difficulty] || q.difficulty}
                  </Badge>
                  {q.aiTagConfidence != null && (
                    <Badge variant="outline" className="text-xs">
                      tag {Math.round(q.aiTagConfidence * 100)}%
                    </Badge>
                  )}
                  {q.hasDiagram && (
                    <Badge variant="outline" className="text-xs">
                      diagram
                    </Badge>
                  )}
                </div>
                <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                  {q.options?.slice(0, 4).map((o, j) => (
                    <li key={j} className={o.isCorrect ? 'font-medium text-foreground' : ''}>
                      {o.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
