export const BATCH_GRADES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "A",
  "O",
] as const;

export type BatchGrade = (typeof BATCH_GRADES)[number];

export function isBatchGrade(value: string): value is BatchGrade {
  return (BATCH_GRADES as readonly string[]).includes(value);
}

export function normalizeBatchGrade(value: unknown, fallback: BatchGrade = "O"): BatchGrade {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (raw === "A" || raw === "O") return raw;
  if (/^([1-9]|10)$/.test(raw)) return raw as BatchGrade;
  return fallback;
}
