export function mapBatchClass(row: Record<string, unknown>) {
  const category = row.categoryId as Record<string, unknown> | null;
  const instructor = row.instructorId as Record<string, unknown> | null;
  const categoryPopulated =
    category && typeof category === "object" && "_id" in category;
  const instructorPopulated =
    instructor && typeof instructor === "object" && "_id" in instructor;

  return {
    _id: String(row._id),
    batchId: String(row.batchId),
    title: String(row.title ?? ""),
    categoryId: categoryPopulated
      ? String(category._id)
      : String(row.categoryId ?? ""),
    categoryName: categoryPopulated ? String(category.name ?? "") : undefined,
    instructorId: instructorPopulated
      ? String(instructor._id)
      : String(row.instructorId ?? ""),
    instructorName: instructorPopulated
      ? String(
          instructor.fullName ||
            [instructor.firstName, instructor.lastName].filter(Boolean).join(" ") ||
            instructor.email ||
            "Instructor",
        )
      : undefined,
    isActive: row.isActive !== false,
    sortOrder: Number(row.sortOrder) || 0,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}

export function mapRoutineSlot(row: Record<string, unknown>) {
  const instructor = row.instructorId as Record<string, unknown> | null;
  const batchClass = row.batchClassId as Record<string, unknown> | null;
  const instructorPopulated =
    instructor && typeof instructor === "object" && "_id" in instructor;
  const classPopulated =
    batchClass && typeof batchClass === "object" && "_id" in batchClass;

  return {
    _id: String(row._id),
    batchId: String(row.batchId),
    batchClassId: classPopulated
      ? String(batchClass._id)
      : row.batchClassId
        ? String(row.batchClassId)
        : undefined,
    batchClassTitle: classPopulated ? String(batchClass.title ?? "") : undefined,
    dayOfWeek: Number(row.dayOfWeek),
    startTime: String(row.startTime ?? ""),
    endTime: String(row.endTime ?? ""),
    topic: String(row.topic ?? ""),
    instructorId: instructorPopulated
      ? String(instructor._id)
      : String(row.instructorId ?? ""),
    instructorName: instructorPopulated
      ? String(
          instructor.fullName ||
            [instructor.firstName, instructor.lastName].filter(Boolean).join(" ") ||
            instructor.email ||
            "Instructor",
        )
      : undefined,
    status: row.status === "inactive" ? "inactive" : "active",
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}
