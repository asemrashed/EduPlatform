import type { NoticeCategory } from "@/types/notice";

export function formatNoticeDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function categoryLabel(category: NoticeCategory | string) {
  switch (category) {
    case "admin":
      return "Platform";
    case "subject":
      return "Subject";
    case "teacher":
      return "Teacher";
    default:
      return category;
  }
}

export function categoryBadgeClass(category: NoticeCategory | string) {
  switch (category) {
    case "admin":
      return "bg-blue-100 text-blue-800";
    case "subject":
      return "bg-emerald-100 text-emerald-800";
    case "teacher":
      return "bg-violet-100 text-violet-800";
    default:
      return "bg-muted text-muted-foreground";
  }
}
