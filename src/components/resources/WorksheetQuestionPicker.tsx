"use client";

import { useCallback, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { questionsStaffService } from "@/services/questionsStaffService";
import { resourceScopeService } from "@/services/resourceScopeService";
import type { Question } from "@/types/exam";
import { LuSearch } from "react-icons/lu";

type WorksheetQuestionPickerProps = {
  role: "admin" | "instructor";
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
  batchScope?: boolean;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

type BankQuestion = Question & {
  course?: { _id: string; title: string };
  chapter?: { _id: string; title: string };
  lessonInfo?: { _id: string; title: string };
};

export function WorksheetQuestionPicker({
  role,
  courseId,
  chapterId,
  lessonId,
  batchScope = false,
  selectedIds,
  onChange,
  disabled = false,
}: WorksheetQuestionPickerProps) {
  const [sourceCourseId, setSourceCourseId] = useState("");
  const [sourceChapterId, setSourceChapterId] = useState("");
  const [courses, setCourses] = useState<{ _id: string; label: string }[]>([]);
  const [chapters, setChapters] = useState<{ _id: string; label: string }[]>([]);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filterCourseId = batchScope ? sourceCourseId : courseId;
  const filterChapterId = batchScope ? sourceChapterId : chapterId;
  const filterLessonId = batchScope ? undefined : lessonId;

  useEffect(() => {
    if (!batchScope) return;
    let cancelled = false;
    (async () => {
      const rows = await resourceScopeService.listCourses();
      if (!cancelled) setCourses(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [batchScope]);

  useEffect(() => {
    if (!batchScope || !sourceCourseId) {
      setChapters([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await resourceScopeService.listChapters(sourceCourseId);
      if (!cancelled) setChapters(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, [batchScope, sourceCourseId]);

  const fetchQuestions = useCallback(async () => {
    if (!filterCourseId && batchScope) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        status: "active",
      });
      if (filterCourseId) params.set("course", filterCourseId);
      if (filterChapterId) params.set("chapter", filterChapterId);
      if (filterLessonId) params.set("lesson", filterLessonId);
      if (search.trim()) params.set("search", search.trim());

      const res = await questionsStaffService.listQuestionBank(role, params.toString());
      const json = (await res.json()) as {
        data?: { questions?: BankQuestion[] };
      };
      setQuestions(json.data?.questions ?? []);
    } finally {
      setLoading(false);
    }
  }, [role, filterCourseId, filterChapterId, filterLessonId, batchScope, search]);

  useEffect(() => {
    void fetchQuestions();
  }, [fetchQuestions]);

  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIds, id]);
    } else {
      onChange(selectedIds.filter((x) => x !== id));
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Course question bank</p>
        <p className="text-xs text-muted-foreground">
          Select questions to assemble into the worksheet PDF.
        </p>
      </div>

      {batchScope ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Source course</p>
            <Select
              value={sourceCourseId}
              onValueChange={(id) => {
                setSourceCourseId(id);
                setSourceChapterId("");
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Chapter (optional)</p>
            <Select
              value={sourceChapterId || "__all__"}
              onValueChange={(id) => setSourceChapterId(id === "__all__" ? "" : id)}
              disabled={disabled || !sourceCourseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All chapters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All chapters</SelectItem>
                {chapters.map((ch) => (
                  <SelectItem key={ch._id} value={ch._id}>
                    {ch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedIds.length} selected
        {loading ? " · Loading..." : ` · ${questions.length} shown`}
      </p>

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {questions.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">
            {batchScope && !sourceCourseId
              ? "Choose a source course to load questions."
              : "No active questions match this scope."}
          </p>
        ) : (
          questions.map((q) => (
            <label
              key={q._id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <Checkbox
                checked={selectedIds.includes(q._id)}
                onCheckedChange={(v) => toggle(q._id, v === true)}
                disabled={disabled}
              />
              <span className="min-w-0 flex-1 text-sm">
                <span className="line-clamp-2">{q.question}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {q.type} · {q.marks} mark{q.marks === 1 ? "" : "s"}
                  {q.lessonInfo?.title ? ` · ${q.lessonInfo.title}` : ""}
                </span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
