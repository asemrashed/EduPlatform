export type NoticeCategory = "admin" | "subject" | "teacher";

export interface NoticeAuthor {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface NoticeRow {
  _id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  subject?: string;
  instructor?: NoticeAuthor;
  batch?: { _id: string; name: string; subject?: string };
  postedBy: NoticeAuthor;
  authorRole: string;
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeDto {
  title: string;
  body: string;
  category: NoticeCategory;
  subject?: string;
  instructorId?: string;
  batchId?: string;
  isActive?: boolean;
  isPinned?: boolean;
  expiresAt?: string;
}

export type UpdateNoticeDto = Partial<CreateNoticeDto>;
