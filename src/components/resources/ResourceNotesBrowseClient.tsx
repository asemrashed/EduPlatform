"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResourceBrowseSkeleton } from "@/components/resources/ResourceBrowseSkeleton";
import { ResourceFreemiumBanner } from "@/components/resources/ResourceFreemiumBanner";
import { ResourcePageContainer } from "@/components/resources/ResourcePageContainer";
import { resourceNotesService } from "@/services/resourceNotesService";
import { DEFAULT_RESOURCE_ACCESS } from "@/lib/resources/access";
import type { ResourceCenterAccess } from "@/types/resourceAccess";
import type { ResourceNoteRow } from "@/types/resourceNote";
import { LuDownload, LuLock, LuSearch } from "react-icons/lu";

type ResourceNotesBrowseClientProps = {
  context: "public" | "student";
  showPageHeader?: boolean;
};

export function ResourceNotesBrowseClient({
  context,
  showPageHeader = true,
}: ResourceNotesBrowseClientProps) {
  const [notes, setNotes] = useState<ResourceNoteRow[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [access, setAccess] = useState<ResourceCenterAccess>(DEFAULT_RESOURCE_ACCESS);
  const [lockedCount, setLockedCount] = useState(0);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (subjectFilter !== "all") params.set("subject", subjectFilter);
      const { res, json } = await resourceNotesService.browsePublic(
        params.toString(),
      );
      if (!res.ok) {
        setError(json.error || "Could not load notes");
        setNotes([]);
        return;
      }
      setNotes(json.data?.notes ?? []);
      setSubjects(json.data?.subjects ?? []);
      setAccess(json.data?.access ?? DEFAULT_RESOURCE_ACCESS);
      setLockedCount(json.data?.stats?.locked ?? 0);
    } catch {
      setError("Could not load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const grouped = useMemo(() => {
    const map = new Map<string, ResourceNoteRow[]>();
    for (const note of notes) {
      const key = `${note.subject} · ${note.topic}`;
      const list = map.get(key) ?? [];
      list.push(note);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [notes]);

  if (loading) {
    return <ResourceBrowseSkeleton showPageHeader={showPageHeader} variant="list" />;
  }

  return (
    <ResourcePageContainer withPadding={showPageHeader}>
      {showPageHeader ? (
        <header className="mb-6">
          <h1 className="font-[family-name:var(--font-headline)] text-2xl font-black tracking-tight text-foreground md:text-3xl">
            Notes
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Subject and topic PDF notes for your studies.
          </p>
        </header>
      ) : null}

      <ResourceFreemiumBanner
        access={access}
        context={context}
        variant="notes"
        lockedCount={lockedCount}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          No notes published yet.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([group, items]) => (
            <section key={group} className="rounded-2xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">{group}</h2>
              <ul className="mt-4 space-y-3">
                {items.map((note) => (
                  <li
                    key={note._id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{note.title}</p>
                      {note.description ? (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {note.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{note.subject}</Badge>
                        {note.accessPolicy === "batch" ? (
                          <Badge variant="secondary">Batch access</Badge>
                        ) : null}
                      </div>
                    </div>

                    {note.canDownload ? (
                      <Button asChild size="sm">
                        <a
                          href={resourceNotesService.downloadHref(note._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LuDownload className="mr-1 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button size="sm" variant="outline" disabled>
                                <LuLock className="mr-1 h-4 w-4" />
                                Locked
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {context === "public" ? (
                              <span>
                                <Link href="/login" className="underline">
                                  Sign in
                                </Link>{" "}
                                and enroll in a matching batch to download.
                              </span>
                            ) : (
                              "Enroll in a matching batch to download."
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ResourcePageContainer>
  );
}
