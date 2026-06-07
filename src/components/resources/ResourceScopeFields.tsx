"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  resourceScopeService,
  type BatchModuleOption,
} from "@/services/resourceScopeService";
import type { ResourceScopeValue } from "@/types/resourceScope";

type Option = { _id: string; label: string };

type ResourceScopeFieldsProps = {
  value: ResourceScopeValue;
  onChange: (next: ResourceScopeValue) => void;
  disabled?: boolean;
};

export function ResourceScopeFields({
  value,
  onChange,
  disabled = false,
}: ResourceScopeFieldsProps) {
  const [batches, setBatches] = useState<Option[]>([]);
  const [modules, setModules] = useState<BatchModuleOption[]>([]);
  const [lessons, setLessons] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [chapters, setChapters] = useState<Option[]>([]);
  const [courseLessons, setCourseLessons] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [batchRows, courseRows] = await Promise.all([
          resourceScopeService.listBatches(),
          resourceScopeService.listCourses(),
        ]);
        if (!cancelled) {
          setBatches(batchRows);
          setCourses(courseRows);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (value.scopeType !== "batch" || !value.batchId) {
      setModules([]);
      setLessons([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await resourceScopeService.listAllBatchModules(value.batchId!);
      if (!cancelled) {
        setModules(rows);
        const mod = rows.find((m) => m._id === value.subjectModuleId);
        setLessons(
          (mod?.lessons ?? []).map((l) => ({ _id: l._id, label: l.title })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value.scopeType, value.batchId, value.subjectModuleId]);

  useEffect(() => {
    if (value.scopeType !== "course" || !value.courseId) {
      setChapters([]);
      setCourseLessons([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await resourceScopeService.listChapters(value.courseId!);
      if (!cancelled) setChapters(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [value.scopeType, value.courseId]);

  useEffect(() => {
    if (value.scopeType !== "course" || !value.chapterId) {
      setCourseLessons([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await resourceScopeService.listLessons(value.chapterId!);
      if (!cancelled) setCourseLessons(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [value.scopeType, value.chapterId]);

  const setScopeType = (scopeType: "batch" | "course") => {
    onChange({
      scopeType,
      batchId: undefined,
      batchClassId: undefined,
      subjectModuleId: undefined,
      subjectLessonId: undefined,
      courseId: undefined,
      chapterId: undefined,
      lessonId: undefined,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Link to</p>
        <Select
          value={value.scopeType}
          onValueChange={(v: "batch" | "course") => setScopeType(v)}
          disabled={disabled || loading}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch">Batch</SelectItem>
            <SelectItem value="course">Course</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.scopeType === "batch" ? (
        <>
          <ScopeSelect
            label="Batch"
            placeholder="Select batch"
            value={value.batchId}
            options={batches}
            disabled={disabled || loading}
            onChange={(batchId) =>
              onChange({
                scopeType: "batch",
                batchId,
                batchClassId: undefined,
                subjectModuleId: undefined,
                subjectLessonId: undefined,
              })
            }
          />
          <ScopeSelect
            label="Module"
            placeholder="Select module"
            value={value.subjectModuleId}
            options={modules}
            disabled={disabled || !value.batchId}
            onChange={(subjectModuleId) => {
              const mod = modules.find((m) => m._id === subjectModuleId);
              setLessons(
                (mod?.lessons ?? []).map((l) => ({ _id: l._id, label: l.title })),
              );
              onChange({
                ...value,
                batchClassId: mod?.subjectId,
                subjectModuleId,
                subjectLessonId: undefined,
              });
            }}
          />
          <ScopeSelect
            label="Topic / lesson"
            placeholder="Select topic or lesson"
            value={value.subjectLessonId}
            options={lessons}
            disabled={disabled || !value.subjectModuleId}
            onChange={(subjectLessonId) => onChange({ ...value, subjectLessonId })}
          />
        </>
      ) : (
        <>
          <ScopeSelect
            label="Course"
            placeholder="Select course"
            value={value.courseId}
            options={courses}
            disabled={disabled || loading}
            onChange={(courseId) =>
              onChange({
                scopeType: "course",
                courseId,
                chapterId: undefined,
                lessonId: undefined,
              })
            }
          />
          <ScopeSelect
            label="Chapter"
            placeholder="Select chapter"
            value={value.chapterId}
            options={chapters}
            disabled={disabled || !value.courseId}
            onChange={(chapterId) =>
              onChange({
                ...value,
                chapterId,
                lessonId: undefined,
              })
            }
          />
          <ScopeSelect
            label="Lesson"
            placeholder="Select lesson"
            value={value.lessonId}
            options={courseLessons}
            disabled={disabled || !value.chapterId}
            onChange={(lessonId) => onChange({ ...value, lessonId })}
          />
        </>
      )}
    </div>
  );
}

function ScopeSelect({
  label,
  placeholder,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  options: Option[];
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled || options.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={options.length ? placeholder : "No options"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function isResourceScopeComplete(scope: ResourceScopeValue): boolean {
  if (scope.scopeType === "batch") {
    return Boolean(
      scope.batchId && scope.subjectModuleId && scope.subjectLessonId,
    );
  }
  return Boolean(scope.courseId && scope.chapterId && scope.lessonId);
}
