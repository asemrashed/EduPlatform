"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminRoleShell } from "@/components/role-area/AdminRoleShell";
import { InstructorRoleShell } from "@/components/role-area/InstructorRoleShell";
import AdminPageWrapper from "@/components/AdminPageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ConfirmModal from "@/components/ui/confirm-modal";
import { ResourceNoteModal } from "@/components/resources/ResourceNoteModal";
import { resourceNotesService } from "@/services/resourceNotesService";
import type { ResourceNoteRow } from "@/types/resourceNote";
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from "react-icons/lu";

type ResourceNotesStaffClientProps = {
  role: "admin" | "instructor";
};

function scopeLabel(note: ResourceNoteRow) {
  if (note.scopeType === "course") {
    const course =
      typeof note.course === "object" && note.course ? note.course.title : "Course";
    const chapter =
      typeof note.chapter === "object" && note.chapter ? note.chapter.title : "";
    const lesson =
      typeof note.lesson === "object" && note.lesson ? note.lesson.title : note.topic;
    return chapter
      ? `Course · ${course} · ${chapter} · ${lesson}`
      : `Course · ${course} · ${lesson}`;
  }
  const batch =
    typeof note.batch === "object" && note.batch ? note.batch.name : note.subject;
  const module =
    typeof note.subjectModule === "object" && note.subjectModule
      ? note.subjectModule.title
      : "";
  const lesson =
    typeof note.subjectLesson === "object" && note.subjectLesson
      ? note.subjectLesson.title
      : note.topic;
  return module
    ? `Batch · ${batch} · ${module} · ${lesson}`
    : `Batch · ${batch} · ${lesson}`;
}

function Shell({
  role,
  children,
}: {
  role: "admin" | "instructor";
  children: ReactNode;
}) {
  if (role === "admin") {
    return (
      <AdminRoleShell>
        <AdminPageWrapper>{children}</AdminPageWrapper>
      </AdminRoleShell>
    );
  }
  return <InstructorRoleShell>{children}</InstructorRoleShell>;
}

export function ResourceNotesStaffClient({ role }: ResourceNotesStaffClientProps) {
  const [notes, setNotes] = useState<ResourceNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ResourceNoteRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceNoteRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", sortOrder: "desc" });
      if (search.trim()) params.set("search", search.trim());
      const { res, json } = await resourceNotesService.listStaff(params.toString());
      if (res.ok) {
        setNotes(json.data?.notes ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { res } = await resourceNotesService.deleteNote(deleteTarget._id);
      if (res.ok) {
        setDeleteTarget(null);
        void fetchNotes();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Shell role={role}>
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Resource notes</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Upload PDF notes organized by subject and topic.
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
            Add note
          </Button>
        </header>

        <div className="relative max-w-md">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            No notes yet. Add your first PDF note.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Scope</th>
                  <th className="px-4 py-3 font-semibold">Access</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note._id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{note.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{scopeLabel(note)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {note.accessPolicy === "batch" ? "Batch" : "Public"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={note.isActive ? "default" : "secondary"}>
                        {note.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(note);
                            setShowModal(true);
                          }}
                        >
                          <LuPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(note)}
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

      <ResourceNoteModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditing(null);
          void fetchNotes();
        }}
        note={editing}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate note?"
        description="This note will be hidden from the resource library."
        confirmText="Deactivate"
        loading={deleting}
      />
    </Shell>
  );
}
