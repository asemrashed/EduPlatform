import { apiFetch } from "@/lib/api/httpClient";
import type {
  CreateResourceNoteDto,
  ResourceNoteRow,
  UpdateResourceNoteDto,
} from "@/types/resourceNote";

type ListEnvelope = {
  success?: boolean;
  data?: {
    notes?: ResourceNoteRow[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext?: boolean;
      hasPrev?: boolean;
    };
  };
  error?: string;
};

type NoteEnvelope = {
  success?: boolean;
  data?: { note?: ResourceNoteRow };
  error?: string;
};

type BrowseEnvelope = {
  success?: boolean;
  data?: { notes?: ResourceNoteRow[]; subjects?: string[] };
  error?: string;
};

export const resourceNotesService = {
  async listStaff(query: string) {
    const res = await apiFetch(`/api/resource-notes?${query}`);
    const json = (await res.json()) as ListEnvelope;
    return { res, json };
  },

  async createNote(payload: CreateResourceNoteDto) {
    const res = await apiFetch("/api/resource-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as NoteEnvelope;
    return { res, json };
  },

  async updateNote(id: string, payload: UpdateResourceNoteDto) {
    const res = await apiFetch(`/api/resource-notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as NoteEnvelope;
    return { res, json };
  },

  async deleteNote(id: string) {
    const res = await apiFetch(`/api/resource-notes/${id}`, { method: "DELETE" });
    const json = (await res.json()) as { success?: boolean; error?: string };
    return { res, json };
  },

  async browsePublic(query = "") {
    const suffix = query ? `?${query}` : "";
    const res = await apiFetch(`/api/public/resource-notes${suffix}`);
    const json = (await res.json()) as BrowseEnvelope;
    return { res, json };
  },

  downloadHref(noteId: string) {
    return `/api/resource-notes/${noteId}/download`;
  },
};
