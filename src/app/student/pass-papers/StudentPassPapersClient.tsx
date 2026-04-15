"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearStudentPassPapersError,
  loadStudentPassPapers,
} from "@/store/slices/studentPassPapersSlice";
import type { PassPaperRow } from "@/types/passPaper";

function courseTitle(p: PassPaperRow): string {
  if (!p.course) return "—";
  if (typeof p.course === "string") return p.course;
  return p.course.title ?? p.course._id;
}

export function StudentPassPapersClient() {
  const dispatch = useAppDispatch();
  const { status, error, passPapers } = useAppSelector(
    (s) => s.studentPassPapers,
  );

  useEffect(() => {
    void dispatch(loadStudentPassPapers());
  }, [dispatch]);

  const loading = status === "idle" || status === "loading";
  const failed = status === "failed" && error;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-black tracking-tight text-foreground md:text-3xl">
          Pass papers
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Papers for courses you are enrolled in (from mock{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">GET /api/enrollments</code>{" "}
          +{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">GET /api/pass-papers</code>
          ).
        </p>
      </header>

      {failed ? (
        <div
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p className="font-semibold">Could not load pass papers</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            onClick={() => {
              dispatch(clearStudentPassPapersError());
              void dispatch(loadStudentPassPapers());
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
              <Badge variant="secondary">{passPapers.length} papers</Badge>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : passPapers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pass papers for your enrolled courses yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Course</th>
                      <th className="pb-2 pr-4 font-medium">Session</th>
                      <th className="pb-2 pr-4 font-medium">Year</th>
                      <th className="pb-2 pr-4 font-medium">Subject</th>
                      <th className="pb-2 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passPapers.map((row) => (
                      <tr key={row._id} className="border-b border-border/60">
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {courseTitle(row)}
                        </td>
                        <td className="py-3 pr-4">{row.sessionName}</td>
                        <td className="py-3 pr-4">{row.year}</td>
                        <td className="py-3 pr-4">{row.subject}</td>
                        <td className="py-3">{row.examType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
