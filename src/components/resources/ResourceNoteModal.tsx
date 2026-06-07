"use client";

import { FormEvent, useEffect, useState } from "react";
import FormModal from "@/components/ui/form-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PDFUpload from "@/components/PDFUpload";
import {
  ResourceScopeFields,
  isResourceScopeComplete,
} from "@/components/resources/ResourceScopeFields";
import type {
  CreateResourceNoteDto,
  ResourceNoteRow,
} from "@/types/resourceNote";
import { emptyResourceScope } from "@/types/resourceScope";
import { resourceNotesService } from "@/services/resourceNotesService";

type ResourceNoteModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  note?: ResourceNoteRow | null;
};

const emptyForm: CreateResourceNoteDto = {
  ...emptyResourceScope,
  title: "",
  pdfUrl: "",
  pdfPublicId: "",
  description: "",
  isActive: true,
  accessPolicy: "public",
};

export function ResourceNoteModal({
  open,
  onClose,
  onSuccess,
  note,
}: ResourceNoteModalProps) {
  const isEdit = Boolean(note?._id);
  const [form, setForm] = useState<CreateResourceNoteDto>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && note) {
      setForm({
        scopeType: note.scopeType ?? "batch",
        batchId: note.batchId,
        batchClassId: note.batchClassId,
        subjectModuleId: note.subjectModuleId,
        subjectLessonId: note.subjectLessonId,
        courseId: note.courseId,
        chapterId: note.chapterId,
        lessonId: note.lessonId,
        title: note.title,
        pdfUrl: note.pdfUrl || "",
        pdfPublicId: note.pdfPublicId || "",
        description: note.description || "",
        isActive: note.isActive ?? true,
        accessPolicy: note.accessPolicy ?? "public",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [isEdit, note, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.title.trim() || !form.pdfUrl.trim()) {
        setError("Title and PDF are required.");
        setLoading(false);
        return;
      }

      if (!isResourceScopeComplete(form)) {
        setError("Complete the batch or course hierarchy before saving.");
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        pdfUrl: form.pdfUrl.trim(),
      };

      const { res, json } = isEdit
        ? await resourceNotesService.updateNote(note!._id, payload)
        : await resourceNotesService.createNote(payload);

      if (!res.ok) {
        setError(json.error || "Failed to save note");
        return;
      }

      onSuccess();
    } catch {
      setError("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit resource note" : "Add resource note"}
      onSubmit={handleSubmit}
      loading={loading}
      submitText={isEdit ? "Save changes" : "Create note"}
      size="lg"
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <ResourceScopeFields
          value={form}
          onChange={(scope) => setForm((f) => ({ ...f, ...scope }))}
        />

        <div>
          <label className="mb-2 block text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Chapter 1 summary"
            required
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">PDF</p>
          <PDFUpload
            currentPDF={form.pdfUrl || null}
            folder="resources/notes"
            description={form.title}
            onPDFChange={(url, publicId) =>
              setForm((f) => ({ ...f, pdfUrl: url, pdfPublicId: publicId }))
            }
            onPDFRemove={() =>
              setForm((f) => ({ ...f, pdfUrl: "", pdfPublicId: "" }))
            }
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Description (optional)
          </label>
          <Input
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Short note about this PDF"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Access</p>
          <Select
            value={form.accessPolicy || "public"}
            onValueChange={(value: "public" | "batch") =>
              setForm((f) => ({ ...f, accessPolicy: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public — anyone can download</SelectItem>
              <SelectItem value="batch">
                Batch — matching batch enrollment required
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          Active (visible in resource library)
        </label>
      </div>
    </FormModal>
  );
}
