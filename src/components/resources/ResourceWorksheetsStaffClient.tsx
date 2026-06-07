"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminRoleShell } from "@/components/role-area/AdminRoleShell";
import { InstructorRoleShell } from "@/components/role-area/InstructorRoleShell";
import AdminPageWrapper from "@/components/AdminPageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { ResourceWorksheetModal } from "@/components/resources/ResourceWorksheetModal";
import { resourceWorksheetsService } from "@/services/resourceWorksheetsService";
import type { ResourceWorksheetRow } from "@/types/resourceWorksheet";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

type ResourceWorksheetsStaffClientProps = {
  role: "admin" | "instructor";
};

function Shell({ role, children }: { role: "admin" | "instructor"; children: ReactNode }) {
  if (role === "admin") {
    return (
      <AdminRoleShell>
        <AdminPageWrapper>{children}</AdminPageWrapper>
      </AdminRoleShell>
    );
  }
  return <InstructorRoleShell>{children}</InstructorRoleShell>;
}

function scopeLabel(row: ResourceWorksheetRow) {
  if (row.scopeType === "course") {
    const course =
      typeof row.course === "object" && row.course
        ? row.course.title
        : "Course";
    const chapter =
      typeof row.chapter === "object" && row.chapter ? row.chapter.title : "";
    const lesson =
      typeof row.lesson === "object" && row.lesson ? row.lesson.title : row.topic;
    return chapter
      ? `Course · ${course} · ${chapter} · ${lesson}`
      : `Course · ${course} · ${lesson}`;
  }
  const batch =
    typeof row.batch === "object" && row.batch ? row.batch.name : "Batch";
  const module =
    typeof row.subjectModule === "object" && row.subjectModule
      ? row.subjectModule.title
      : "";
  const lesson =
    typeof row.subjectLesson === "object" && row.subjectLesson
      ? row.subjectLesson.title
      : row.topic;
  return module
    ? `Batch · ${batch} · ${module} · ${lesson}`
    : `Batch · ${batch} · ${lesson}`;
}

export function ResourceWorksheetsStaffClient({ role }: ResourceWorksheetsStaffClientProps) {
  const [worksheets, setWorksheets] = useState<ResourceWorksheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ResourceWorksheetRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceWorksheetRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWorksheets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (search.trim()) params.set("search", search.trim());
      const { res, json } = await resourceWorksheetsService.listStaff(params.toString());
      if (res.ok) setWorksheets(json.data?.worksheets ?? []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchWorksheets();
  }, [fetchWorksheets]);

  return (
    <Shell role={role}>
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Topical worksheets</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Assemble worksheets from the course question bank or upload a PDF.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
          >
            <LuPlus className="mr-1 h-4 w-4" />
            Build worksheet
          </Button>
        </header>

        <div className="relative max-w-md">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search worksheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading worksheets...</p>
        ) : worksheets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            No worksheets yet. Click Build worksheet to create one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Access</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {worksheets.map((row) => (
                  <tr key={row._id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{row.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{scopeLabel(row)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {row.sourceType === "course_qb" ? "QB" : "Upload"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {row.accessPolicy === "batch" ? "Batch" : "Public"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.isActive ? "default" : "secondary"}>
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(row);
                            setShowModal(true);
                          }}
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <LuTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ResourceWorksheetModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditing(null);
          void fetchWorksheets();
        }}
        worksheet={editing}
        role={role}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
            const { res } = await resourceWorksheetsService.deleteWorksheet(deleteTarget._id);
            if (res.ok) {
              setDeleteTarget(null);
              void fetchWorksheets();
            }
          } finally {
            setDeleting(false);
          }
        }}
        title="Deactivate worksheet?"
        description="This worksheet will be hidden from the resource library."
        confirmText="Deactivate"
        loading={deleting}
      />
    </Shell>
  );
}
