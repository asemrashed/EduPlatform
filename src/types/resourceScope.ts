export type ResourceScopeType = "batch" | "course";

export type ResourceScopeValue = {
  scopeType: ResourceScopeType;
  batchId?: string;
  /** BatchClass / subject within the batch */
  batchClassId?: string;
  /** SubjectModule within the batch subject */
  subjectModuleId?: string;
  /** SubjectLesson (topic/lesson) within the module */
  subjectLessonId?: string;
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
};

export const emptyResourceScope: ResourceScopeValue = {
  scopeType: "batch",
};
