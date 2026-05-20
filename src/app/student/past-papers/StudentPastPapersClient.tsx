"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearStudentPastPapersError,
  loadStudentPastPapers,
} from "@/store/slices/studentPastPapersSlice";
import type { PastPaperFileType, PastPaperRow } from "@/types/pastPaper";
import { LuDownload, LuLock } from "react-icons/lu";

function courseTitle(p: PastPaperRow): string {
  if (!p.course) return "—";
  if (typeof p.course === "string") return p.course;
  return p.course.title ?? p.course._id;
}

function courseId(p: PastPaperRow): string {
  if (!p.course) return "";
  if (typeof p.course === "string") return p.course;
  return p.course._id ?? "";
}

const FILE_LINKS: { type: PastPaperFileType; label: string; field: keyof PastPaperRow }[] = [
  { type: "question_paper", label: "Question", field: "questionPaperUrl" },
  { type: "marks_pdf", label: "Marks", field: "marksPdfUrl" },
  { type: "work_solution", label: "Solution", field: "workSolutionUrl" },
];

function downloadHref(paperId: string, type: PastPaperFileType) {
  return `/api/past-papers/${paperId}/download?type=${type}`;
}

export function StudentPastPapersClient() {
  const dispatch = useAppDispatch();
  const { status, error, pastPapers, enrolledCourseIds } = useAppSelector(
    (s) => s.studentPastPapers,
  );

  useEffect(() => {
    void dispatch(loadStudentPastPapers());
  }, [dispatch]);

  const enrolledSet = new Set(enrolledCourseIds);
  const loading = status === "idle" || status === "loading";
  const failed = status === "failed" && error;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Past papers
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Download past exam papers for courses you are enrolled in. Papers must be
          active and tied to your enrollment.
        </p>
      </header>

      {failed ? (
        <div
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-semibold">Could not load past papers</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            onClick={() => {
              dispatch(clearStudentPastPapersError());
              void dispatch(loadStudentPastPapers());
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {!failed ? (
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">
              Your course papers
            </CardTitle>
            {loading ? (
              <Badge variant="secondary">Loading…</Badge>
            ) : (
              <Badge variant="secondary">{pastPapers.length} papers</Badge>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : pastPapers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No past papers for your enrolled courses yet.
              </p>
            ) : (
              <TooltipProvider>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="pb-2 pr-4 font-medium">Course</th>
                        <th className="pb-2 pr-4 font-medium">Session</th>
                        <th className="pb-2 pr-4 font-medium">Year</th>
                        <th className="pb-2 pr-4 font-medium">Subject</th>
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 font-medium">Downloads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastPapers.map((row) => {
                        const cid = courseId(row);
                        const canAccess =
                          row.isActive !== false &&
                          cid &&
                          enrolledSet.has(String(cid));

                        return (
                          <tr key={row._id} className="border-b border-border/60">
                            <td className="py-3 pr-4 font-medium text-foreground">
                              {courseTitle(row)}
                            </td>
                            <td className="py-3 pr-4">{row.sessionName}</td>
                            <td className="py-3 pr-4">{row.year}</td>
                            <td className="py-3 pr-4">{row.subject}</td>
                            <td className="py-3 pr-4">{row.examType}</td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-2">
                                {FILE_LINKS.map(({ type, label, field }) => {
                                  const hasFile = Boolean(row[field]);
                                  if (canAccess && hasFile) {
                                    return (
                                      <Button
                                        key={type}
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1"
                                        asChild
                                      >
                                        <Link
                                          href={downloadHref(row._id, type)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <LuDownload className="h-3.5 w-3.5" />
                                          {label}
                                        </Link>
                                      </Button>
                                    );
                                  }

                                  return (
                                    <Tooltip key={type}>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1"
                                            disabled
                                            type="button"
                                          >
                                            <LuLock className="h-3.5 w-3.5" />
                                            {label}
                                          </Button>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {canAccess
                                          ? "File not available"
                                          : "Enroll to download"}
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
