/** Query string shape for `GET /api/public/courses` (learning-project route). */
export type PublicCoursesQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  pricing?: "all" | "free" | "paid";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
