'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { LuPlus as Plus, LuSave as Save, LuLoader as Loader2, LuTriangleAlert as AlertCircle } from 'react-icons/lu';;
import { useLessonQuiz, LessonQuizQuestionInput, LessonQuizQuestionView } from '@/hooks/useLessonQuiz';
import FormModal from '@/components/ui/form-modal';

interface LessonQuizModalProps {
  open: boolean;
  onClose: () => void;
  lessonId: string;
}

export default function LessonQuizModal({ open, onClose, lessonId }: LessonQuizModalProps) {
  const { loading, error, fetchQuestions, bulkCreate } = useLessonQuiz();
  const [existing, setExisting] = useState<LessonQuizQuestionView[]>([]);
  const [pending, setPending] = useState<LessonQuizQuestionInput[]>([
    { question: '', options: ['', ''], correctOptionIndex: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvParsing, setCsvParsing] = useState(false);

  const parseCsvText = (text: string) => {
    setCsvError(null);
    try {
      const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
      if (rows.length < 2) {
        throw new Error('CSV must include a header and at least one row');
      }
      const header = rows[0].split(',').map(h => h.trim().toLowerCase());
      const qIdx = header.indexOf('question');
      const oIdx = header.indexOf('options');
      const cIdx = header.indexOf('correct');
      if (qIdx === -1 || oIdx === -1 || cIdx === -1) {
        throw new Error('Header must include question, options, correct');
      }
      const parsed: LessonQuizQuestionInput[] = [];
      for (const row of rows.slice(1)) {
        const cells = row.split(',');
        const question = (cells[qIdx] || '').replace(/^"|"$/g, '').trim();
        const optionsCell = (cells[oIdx] || '').replace(/^"|"$/g, '').trim();
        const correctCell = (cells[cIdx] || '').replace(/^"|"$/g, '').trim();
        if (!question || !optionsCell) continue;
        const options = optionsCell.split(';').map(o => o.trim()).filter(Boolean);
        if (options.length < 2) continue;
        let correctOptionIndex = 0;
        if (/^\d+$/.test(correctCell)) {
          correctOptionIndex = Math.max(0, Math.min(options.length - 1, parseInt(correctCell, 10)));
        } else {
          const idx = options.findIndex(o => o.toLowerCase() === correctCell.toLowerCase());
          correctOptionIndex = idx >= 0 ? idx : 0;
        }
        parsed.push({ question, options, correctOptionIndex });
      }
      if (parsed.length === 0) {
        throw new Error('No valid rows parsed. Ensure options are semicolon-separated and correct is index or exact option');
      }
      return parsed;
    } catch (e: any) {
      setCsvError(e?.message || 'Failed to parse CSV');
      return null;
    }
  };

  const handleCsvFile = async (file: File) => {
    setCsvParsing(true);
    setCsvError(null);
    try {
      const text = await file.text();
      const parsed = parseCsvText(text);
      if (parsed && parsed.length > 0) {
        setPending(parsed);
      }
    } catch (e: any) {
      setCsvError(e?.message || 'Could not read CSV file');
    } finally {
      setCsvParsing(false);
    }
  };

  useEffect(() => {
    if (open && lessonId) {
      fetchQuestions(lessonId).then(setExisting);
      setFormError(null);
    }
  }, [open, lessonId, fetchQuestions]);

  const addPending = () => {
    setPending((p) => [...p, { question: '', options: ['', ''], correctOptionIndex: 0 }]);
  };

  const removePending = (idx: number) => {
    setPending((p) => p.filter((_, i) => i !== idx));
  };

  const setPendingField = (idx: number, field: keyof LessonQuizQuestionInput, value: any) => {
    setPending((p) => p.map((q, i) => (i === idx ? { ...q, [field]: value } : q)));
  };

  const setOption = (qIdx: number, oIdx: number, value: string) => {
    setPending((p) => p.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q)));
  };

  const addOption = (qIdx: number) => {
    setPending((p) => p.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setPending((p) => p.map((q, i) => (i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q)));
  };

  const canSave = useMemo(() => {
    return pending.length > 0 && pending.every((q) => q.question.trim().length > 0 && q.options.filter((o) => o.trim().length > 0).length >= 2 && q.correctOptionIndex >= 0 && q.correctOptionIndex < q.options.length);
  }, [pending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    setFormError(null);
    try {
      const filtered = pending.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter((o) => o.length > 0),
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation?.trim() || undefined,
        isActive: true,
      }));
      const created = await bulkCreate(lessonId, filtered);
      if (created) {
        setExisting((e) => [...created, ...e]);
        setPending([{ question: '', options: ['', ''], correctOptionIndex: 0 }]);
        onClose();
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Manage Lesson Quiz"
      description="Create multiple-choice questions for this lesson"
      submitText={saving ? 'Saving...' : 'Save Questions'}
      loading={saving}
      size="xl"
    >
      {(formError || error) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{formError || error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Questions</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : existing.length === 0 ? (
            <div className="text-sm text-gray-500">No questions yet.</div>
          ) : (
            <ul className="space-y-3">
              {existing.map((q) => (
                <li key={q._id} className="border rounded p-3 border-blue-300 hover:border-blue-400">
                  <div className="font-medium mb-1">{q.question}</div>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {q.options.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                  {q.explanation && <div className="text-xs text-gray-500 mt-2">Explanation: {q.explanation}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add Questions</h3>
          <div className="mb-3 p-3 border rounded-lg border-blue-300 hover:border-blue-400 bg-blue-50/30">
            <div className="text-xs font-medium text-gray-700 mb-2">Upload CSV</div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCsvFile(f);
              }}
              className="block text-sm"
            />
            <div className="text-xs text-gray-600 mt-2">
              Expected headers: <code>question, options, correct</code>. Options are semicolon-separated. Correct can be a 0-based index or exact option text.
              <div className="mt-2 border rounded p-2 bg-white">
                <a href="/lesson-quiz-sample.csv" download className="text-blue-600 hover:underline">Download example CSV</a>
              </div>
            </div>
            {csvParsing && <div className="text-xs text-blue-600 mt-2">Parsing CSV...</div>}
            {csvError && <div className="text-xs text-red-600 mt-2">{csvError}</div>}
          </div>
          <div className="space-y-6">
            {pending.map((q, idx) => (
              <div key={idx} className="border rounded-lg p-3 border-blue-300 hover:border-blue-400">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">Question {idx + 1}</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePending(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <AttractiveInput
                  label="Question"
                  value={q.question}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPendingField(idx, 'question', e.target.value)}
                  placeholder="Enter question"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                />
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-600">Options</div>
                  {q.options.map((opt, oidx) => (
                    <div key={oidx} className="flex items-center gap-2">
                      <AttractiveInput
                        placeholder={`Option ${oidx + 1}`}
                        value={opt}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOption(idx, oidx, e.target.value)}
                        variant="default"
                        colorScheme="primary"
                        size="md"
                      />
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctOptionIndex === oidx}
                          onChange={() => setPendingField(idx, 'correctOptionIndex', oidx)}
                        />
                        Correct
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(idx, oidx)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addOption(idx)} className="mt-1">
                    <Plus className="w-4 h-4 mr-1" /> Add Option
                  </Button>
                </div>
                <div className="mt-3">
                  <AttractiveTextarea
                    label="Explanation (optional)"
                    value={q.explanation || ''}
                    onChange={(e) => setPendingField(idx, 'explanation', e.target.value)}
                    rows={2}
                    variant="default"
                    colorScheme="primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button type="button" variant="outline" onClick={addPending}>
              <Plus className="w-4 h-4 mr-1" /> Add Another
            </Button>
            <Button type="submit" disabled={!canSave || saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Questions'}
            </Button>
          </div>
        </div>
      </div>
    </FormModal>
  );
}


