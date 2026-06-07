import type { ResourceScopeValue } from "@/types/resourceScope";

export type ResourceNoteAccessPolicy = "public" | "batch";

export type ResourceNoteRow = ResourceScopeValue & {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  description?: string;
  isActive: boolean;
  accessPolicy: ResourceNoteAccessPolicy;
  canDownload?: boolean;
  uploadedBy?: string | { _id: string; fullName?: string; email?: string };
  batch?: { _id: string; name?: string };
  batchClass?: { _id: string; title?: string };
  subjectModule?: { _id: string; title?: string };
  subjectLesson?: { _id: string; title?: string };
  course?: { _id: string; title?: string };
  chapter?: { _id: string; title?: string };
  lesson?: { _id: string; title?: string };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateResourceNoteDto = ResourceScopeValue & {
  title: string;
  subject?: string;
  topic?: string;
  pdfUrl: string;
  pdfPublicId?: string;
  description?: string;
  isActive?: boolean;
  accessPolicy?: ResourceNoteAccessPolicy;
};

export type UpdateResourceNoteDto = Partial<CreateResourceNoteDto>;
