"use client";

import { FormEvent, useEffect, useState } from "react";
import FormModal from "@/components/ui/form-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PDFUpload from "@/components/PDFUpload";
import {
  ResourceScopeFields,
  isResourceScopeComplete,
} from "@/components/resources/ResourceScopeFields";
import { WorksheetQuestionPicker } from "@/components/resources/WorksheetQuestionPicker";
import { resourceWorksheetsService } from "@/services/resourceWorksheetsService";
import type { CreateResourceWorksheetDto, ResourceWorksheetRow } from "@/types/resourceWorksheet";
import { emptyResourceScope } from "@/types/resourceScope";

type BuildMode = "upload" | "course_qb";

type ResourceWorksheetModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  worksheet?: ResourceWorksheetRow | null;
  role?: "admin" | "instructor";
};

const emptyForm: CreateResourceWorksheetDto = {
  ...emptyResourceScope,
  title: "",
  pdfUrl: "",
  pdfPublicId: "",
  description: "",
  isActive: true,
  accessPolicy: "public",
};

export function ResourceWorksheetModal({
  open,
  onClose,
  onSuccess,
  worksheet,
  role = "admin",
}: ResourceWorksheetModalProps) {
  const isEdit = Boolean(worksheet?._id);
  const [buildMode, setBuildMode] = useState<BuildMode>("course_qb");
  const [form, setForm] = useState<CreateResourceWorksheetDto>(emptyForm);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && worksheet) {
      setBuildMode(worksheet.sourceType === "course_qb" ? "course_qb" : "upload");
      setForm({
        scopeType: worksheet.scopeType ?? "batch",
        batchId: worksheet.batchId,
        batchClassId: worksheet.batchClassId,
        subjectModuleId: worksheet.subjectModuleId,
        subjectLessonId: worksheet.subjectLessonId,
        courseId: worksheet.courseId,
        chapterId: worksheet.chapterId,
        lessonId: worksheet.lessonId,
        title: worksheet.title,
        pdfUrl: worksheet.pdfUrl || "",
        pdfPublicId: worksheet.pdfPublicId || "",
        description: worksheet.description || "",
        isActive: worksheet.isActive ?? true,
        accessPolicy: worksheet.accessPolicy ?? "public",
      });
      setQuestionIds(worksheet.questionIds ?? []);
    } else {
      setBuildMode("course_qb");
      setForm(emptyForm);
      setQuestionIds([]);
      setIncludeAnswers(false);
    }
    setError(null);
  }, [isEdit, worksheet, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.title.trim()) {
        setError("Title is required.");
        setLoading(false);
        return;
      }

      if (!isResourceScopeComplete(form)) {
        setError("Complete the batch or course hierarchy before saving.");
        setLoading(false);
        return;
      }

      if (!isEdit && buildMode === "upload" && !form.pdfUrl.trim()) {
        setError("Upload a PDF or switch to question bank assembly.");
        setLoading(false);
        return;
      }

      if (!isEdit && buildMode === "course_qb" && questionIds.length === 0) {
        setError("Select at least one question from the course question bank.");
        setLoading(false);
        return;
      }

      const scopePayload = {
        scopeType: form.scopeType,
        batchId: form.batchId,
        batchClassId: form.batchClassId,
        subjectModuleId: form.subjectModuleId,
        subjectLessonId: form.subjectLessonId,
        courseId: form.courseId,
        chapterId: form.chapterId,
        lessonId: form.lessonId,
      };

      let res: Response;
      let json: { success?: boolean; error?: string };

      if (!isEdit && buildMode === "course_qb") {
        ({ res, json } = await resourceWorksheetsService.generateWorksheet({
          ...scopePayload,
          title: form.title.trim(),
          questionIds,
          includeAnswers,
          description: form.description,
          isActive: form.isActive,
          accessPolicy: form.accessPolicy,
        }));
      } else {
        const payload = {
          ...form,
          ...scopePayload,
          title: form.title.trim(),
          pdfUrl: form.pdfUrl.trim(),
        };
        ({ res, json } = isEdit
          ? await resourceWorksheetsService.updateWorksheet(worksheet!._id, payload)
          : await resourceWorksheetsService.createWorksheet(payload));
      }

      if (!res.ok) {
        setError(json.error || "Failed to save worksheet");
        return;
      }

      onSuccess();
    } catch {
      setError("Failed to save worksheet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit worksheet" : "Build worksheet"}
      onSubmit={handleSubmit}
      loading={loading}
      submitText={isEdit ? "Save changes" : buildMode === "course_qb" ? "Generate worksheet" : "Create worksheet"}
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
            placeholder="Functions practice sheet"
            required
          />
        </div>

        {!isEdit ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={buildMode === "course_qb" ? "default" : "outline"}
                onClick={() => setBuildMode("course_qb")}
              >
                From question bank
              </Button>
              <Button
                type="button"
                size="sm"
                variant={buildMode === "upload" ? "default" : "outline"}
                onClick={() => setBuildMode("upload")}
              >
                Upload PDF
              </Button>
            </div>

            {buildMode === "course_qb" ? (
              <>
                <WorksheetQuestionPicker
                  role={role}
                  batchScope={form.scopeType === "batch"}
                  courseId={form.courseId}
                  chapterId={form.chapterId}
                  lessonId={form.lessonId}
                  selectedIds={questionIds}
                  onChange={setQuestionIds}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeAnswers}
                    onChange={(e) => setIncludeAnswers(e.target.checked)}
                  />
                  Include answer key at end of PDF
                </label>
              </>
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Worksheet PDF</p>
                <PDFUpload
                  currentPDF={form.pdfUrl || null}
                  folder="resources/worksheets"
                  description={form.title}
                  onPDFChange={(url, publicId) =>
                    setForm((f) => ({ ...f, pdfUrl: url, pdfPublicId: publicId }))
                  }
                  onPDFRemove={() =>
                    setForm((f) => ({ ...f, pdfUrl: "", pdfPublicId: "" }))
                  }
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {worksheet?.sourceType === "course_qb"
              ? `Generated from ${worksheet.questionIds?.length ?? 0} course QB question(s). Edit metadata below; re-generate by creating a new worksheet.`
              : "Uploaded PDF worksheet. Replace the file from the worksheets list if needed."}
          </p>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">Description (optional)</label>
          <Input
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
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
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="batch">Batch enrollment required</SelectItem>
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
          Active
        </label>
      </div>
    </FormModal>
  );
}
