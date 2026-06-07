import type { ResourceScopeValue } from "@/types/resourceScope";

export type ResourceWorksheetAccessPolicy = "public" | "batch";
export type ResourceWorksheetSourceType = "upload" | "course_qb";

export type ResourceWorksheetRow = ResourceScopeValue & {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  pdfUrl?: string;
  pdfPublicId?: string;
  sourceType?: ResourceWorksheetSourceType;
  questionIds?: string[];
  description?: string;
  isActive: boolean;
  accessPolicy: ResourceWorksheetAccessPolicy;
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

export type CreateResourceWorksheetDto = ResourceScopeValue & {
  title: string;
  pdfUrl: string;
  pdfPublicId?: string;
  description?: string;
  isActive?: boolean;
  accessPolicy?: ResourceWorksheetAccessPolicy;
};

export type UpdateResourceWorksheetDto = Partial<CreateResourceWorksheetDto>;

export type GenerateResourceWorksheetDto = ResourceScopeValue & {
  title: string;
  questionIds: string[];
  includeAnswers?: boolean;
  description?: string;
  isActive?: boolean;
  accessPolicy?: ResourceWorksheetAccessPolicy;
};
