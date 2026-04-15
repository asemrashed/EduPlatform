'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import ConfirmModal from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LuPlus as Plus, LuPencil as Pencil, LuTrash2 as Trash2, LuCircleAlert as HelpCircle, LuBookOpen as BookOpen, LuLoader as Loader2 } from 'react-icons/lu';
import { Checkbox } from '@/components/ui/checkbox';

type QAPair = { _id?: string; question: string; answer: string };

export interface CourseFAQItem {
  _id: string;
  course: { _id: string; title: string } | string;
  question: string;
  answer: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

function FAQPageContent() {
  const [courses, setCourses] = useState<Array<{ _id: string; title: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [faqs, setFaqs] = useState<CourseFAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formCourseId, setFormCourseId] = useState('');
  const [formQaPairs, setFormQaPairs] = useState<QAPair[]>([{ question: '', answer: '' }]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<CourseFAQItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>([]);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await fetch('/api/courses?limit=500&page=1&status=published');
      const data = await res.json();
      if (res.ok && data.data?.courses) {
        setCourses(data.data.courses);
        if (!selectedCourseId && data.data.courses.length > 0) {
          setSelectedCourseId(data.data.courses[0]._id);
        }
      }
    } catch (e) {
      console.error('Error fetching courses:', e);
      setError('Failed to load courses');
    } finally {
      setCoursesLoading(false);
    }
  }, [selectedCourseId]);

  const fetchFaqs = useCallback(async () => {
    if (!selectedCourseId) {
      setFaqs([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/faqs?course=${selectedCourseId}&limit=100`);
      const data = await res.json();
      if (res.ok && data.data?.faqs) {
        setFaqs(data.data.faqs);
      } else {
        setFaqs([]);
        if (!data.success) setError(data.error || 'Failed to load FAQs');
      }
    } catch (e) {
      console.error('Error fetching FAQs:', e);
      setError('Failed to load FAQs');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const isEditMode = formQaPairs.some((p) => p._id);

  const openAddForm = () => {
    setFormCourseId(selectedCourseId || (courses[0]?._id ?? ''));
    setFormQaPairs([{ question: '', answer: '' }]);
    setShowForm(true);
  };

  const openEditForm = (faq: CourseFAQItem) => {
    setFormCourseId(typeof faq.course === 'object' ? faq.course._id : faq.course);
    setFormQaPairs([{ _id: faq._id, question: faq.question, answer: faq.answer }]);
    setShowForm(true);
  };

  const openEditMultipleForm = (items: CourseFAQItem[]) => {
    if (items.length === 0) return;
    const courseId = typeof items[0].course === 'object' ? items[0].course._id : items[0].course;
    setFormCourseId(courseId);
    setFormQaPairs(
      items.map((f) => ({ _id: f._id, question: f.question, answer: f.answer }))
    );
    setSelectedFaqIds([]);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormQaPairs([{ question: '', answer: '' }]);
  };

  const addQaPair = () => {
    setFormQaPairs((prev) => [...prev, { question: '', answer: '' }]);
  };

  const removeQaPair = (index: number) => {
    setFormQaPairs((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const updateQaPair = (index: number, field: 'question' | 'answer', value: string) => {
    setFormQaPairs((prev) =>
      prev.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair))
    );
  };

  const toggleFaqSelection = (id: string) => {
    setSelectedFaqIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFaqs = () => {
    setSelectedFaqIds(faqs.length === selectedFaqIds.length ? [] : faqs.map((f) => f._id));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId) {
      setError('Please select a course');
      return;
    }
    const validPairs = formQaPairs.filter(
      (p) => p.question.trim() && p.answer.trim()
    );
    if (validPairs.length === 0) {
      setError('Add at least one question and answer.');
      return;
    }
    setFormSubmitting(true);
    setError(null);
    try {
      const toUpdate = validPairs.filter((p): p is QAPair & { _id: string } => !!p._id);
      const toCreate = validPairs.filter((p) => !p._id);

      const updatePromises = toUpdate.map((p) =>
        fetch(`/api/admin/faqs/${p._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course: formCourseId,
            question: p.question.trim(),
            answer: p.answer.trim(),
          }),
        })
      );
      let createOk = true;
      if (toCreate.length > 0) {
        const createRes = await fetch('/api/admin/faqs/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course: formCourseId,
            faqs: toCreate.map((p) => ({
              question: p.question.trim(),
              answer: p.answer.trim(),
            })),
          }),
        });
        const createData = await createRes.json();
        createOk = createRes.ok && createData.success;
        if (!createOk) setError(createData.error || 'Failed to create new FAQs');
      }

      const updateResults = await Promise.all(updatePromises);
      const updateOk = updateResults.every((r) => r.ok);
      if (!updateOk && toUpdate.length > 0) {
        setError('Failed to update some FAQs.');
      }

      if ((toUpdate.length === 0 || updateOk) && (toCreate.length === 0 || createOk)) {
        closeForm();
        fetchFaqs();
        if (selectedCourseId !== formCourseId) setSelectedCourseId(formCourseId);
      }
    } catch (e) {
      console.error('Error saving FAQ:', e);
      setError('Something went wrong');
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDeleteModal = (faq: CourseFAQItem) => {
    setFaqToDelete(faq);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/faqs/${faqToDelete._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowDeleteModal(false);
        setFaqToDelete(null);
        fetchFaqs();
      } else {
        setError(data.error || 'Failed to delete FAQ');
      }
    } catch (e) {
      console.error('Error deleting FAQ:', e);
      setError('Something went wrong');
    } finally {
      setDeleting(false);
    }
  };

  const courseTitle = (faq: CourseFAQItem) =>
    typeof faq.course === 'object' && faq.course?.title ? faq.course.title : '—';

  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection
          title="Course FAQ"
          description="Create and manage FAQs for each course. Select a course to view or add FAQs."
        />

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <PageSection
          title="FAQs by course"
          description="Choose a course to manage its frequently asked questions"
          className="mb-4"
          actions={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Select
                value={selectedCourseId}
                onValueChange={(v) => setSelectedCourseId(v)}
                disabled={coursesLoading}
              >
                <SelectTrigger className="w-full border-gray-300 bg-white sm:w-64 focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20">
                  <SelectValue placeholder="Select course..." />
                </SelectTrigger>
                <SelectContent className="border-gray-200 bg-white shadow-lg">
                  {courses.map((c) => (
                    <SelectItem
                      key={c._id}
                      value={c._id}
                      className="bg-white hover:bg-gray-100 focus:bg-[#7B2CBF]/10 focus:text-gray-900 data-[highlighted]:bg-[#7B2CBF]/10"
                    >
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={openAddForm}
                disabled={coursesLoading || !courses.length}
                className="flex items-center gap-2 bg-[#7B2CBF] text-white hover:bg-[#6A1FA8]"
              >
                <Plus className="h-5 w-5" />
                Add FAQ
              </Button>
            </div>
          }
        >
          <div className="rounded-lg border border-gray-200 bg-white">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#7B2CBF]" />
              </div>
            ) : !selectedCourseId ? (
              <div className="py-16 text-center text-gray-500">
                <BookOpen className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>Select a course to view or add FAQs.</p>
              </div>
            ) : faqs.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <HelpCircle className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No FAQs for this course yet.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={openAddForm}
                >
                  Add first FAQ
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <Checkbox
                      checked={selectedFaqIds.length === faqs.length && faqs.length > 0}
                      onCheckedChange={selectAllFaqs}
                    />
                    Select all
                  </label>
                  {selectedFaqIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openEditMultipleForm(faqs.filter((f) => selectedFaqIds.includes(f._id)))
                      }
                      className="ml-2 gap-1 border-[#7B2CBF]/40 text-[#7B2CBF] hover:bg-[#7B2CBF]/10"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit selected ({selectedFaqIds.length})
                    </Button>
                  )}
                </div>
                <ul className="divide-y divide-gray-100">
                  {faqs.map((faq, index) => (
                    <li
                      key={faq._id}
                      className="flex flex-col gap-2 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <Checkbox
                          checked={selectedFaqIds.includes(faq._id)}
                          onCheckedChange={() => toggleFaqSelection(faq._id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">
                            {index + 1}. {faq.question}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2 pl-6 sm:pl-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(faq)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteModal(faq)}
                          className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </PageSection>

        {/* Add/Edit FAQ Modal */}
        <Dialog open={showForm} onOpenChange={(open) => !open && closeForm()}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader className="space-y-2 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7B2CBF]/10">
                  <HelpCircle className="h-5 w-5 text-[#7B2CBF]" />
                </div>
                <div>
                  <DialogTitle className="text-lg">
                    {isEditMode ? 'Edit FAQ(s)' : 'Create new FAQ'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    {isEditMode
                      ? 'Update questions and answers. Add new rows to create more FAQs in one go.'
                      : 'Add one or more FAQs for this course. Use "Add another Q&A" for multiple.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmitForm} className="space-y-5 pt-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">Course</label>
                <Select
                  value={formCourseId}
                  onValueChange={setFormCourseId}
                  disabled={isEditMode}
                >
                  <SelectTrigger className="h-11 w-full border-gray-300 bg-white focus:border-[#7B2CBF] focus:ring-[#7B2CBF]/20 disabled:opacity-60">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 bg-white shadow-lg">
                    {courses.map((c) => (
                      <SelectItem
                        key={c._id}
                        value={c._id}
                        className="bg-white hover:bg-gray-100 focus:bg-[#7B2CBF]/10 focus:text-gray-900 data-[highlighted]:bg-[#7B2CBF]/10"
                      >
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditMode && (
                  <p className="text-xs text-gray-500">Course cannot be changed when editing.</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-800">
                    Questions &amp; Answers
                  </label>
                  <span className="text-xs text-gray-500">
                    {isEditMode ? 'Edit multiple or add new rows' : 'Add multiple FAQs at once'}
                  </span>
                </div>
                <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
                  {formQaPairs.map((pair, index) => (
                    <div
                      key={pair._id ?? `new-${index}`}
                      className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">
                          {pair._id ? `FAQ #${index + 1} (edit)` : `FAQ #${index + 1}`}
                        </span>
                        {formQaPairs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQaPair(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <AttractiveInput
                          value={pair.question}
                          onChange={(e) => updateQaPair(index, 'question', e.target.value)}
                          placeholder="Question"
                          maxLength={500}
                          className="w-full"
                        />
                        <textarea
                          value={pair.answer}
                          onChange={(e) => updateQaPair(index, 'answer', e.target.value)}
                          placeholder="Answer"
                          maxLength={5000}
                          rows={3}
                          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#7B2CBF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/20"
                        />
                        <div className="flex justify-end text-xs text-gray-500">
                          {pair.question.length}/500 · {pair.answer.length}/5000
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQaPair}
                  className="w-full border-dashed border-[#7B2CBF]/40 text-[#7B2CBF] hover:bg-[#7B2CBF]/5"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add another Q&amp;A
                </Button>
              </div>

              <DialogFooter className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={formSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    formSubmitting ||
                    !formCourseId ||
                    !formQaPairs.some((p) => p.question.trim() && p.answer.trim())
                  }
                  className="w-full bg-[#7B2CBF] text-white hover:bg-[#6A1FA8] sm:w-auto"
                >
                  {formSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {(() => {
                    const valid = formQaPairs.filter((p) => p.question.trim() && p.answer.trim());
                    const updating = valid.filter((p) => p._id).length;
                    const creating = valid.filter((p) => !p._id).length;
                    if (updating && creating)
                      return `Save ${updating} & create ${creating}`;
                    if (updating) return updating > 1 ? `Save ${updating} FAQs` : 'Save changes';
                    if (creating) return creating > 1 ? `Create ${creating} FAQs` : 'Create FAQ';
                    return 'Save';
                  })()}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setFaqToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete FAQ"
          description={faqToDelete ? `Are you sure you want to delete this FAQ? "${faqToDelete.question.substring(0, 50)}${faqToDelete.question.length > 50 ? '...' : ''}"` : ''}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
        />
      </main>
    </AdminRoleShell>
  );
}

export default function FAQPage() {
  return (
    <AdminPageWrapper>
      <FAQPageContent />
    </AdminPageWrapper>
  );
}
