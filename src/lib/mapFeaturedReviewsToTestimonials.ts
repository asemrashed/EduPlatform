import type { TestimonialItem } from "@/components/home/Testimonials";
import type { CourseReview } from "@/types/course-review";

export function mapFeaturedReviewsToTestimonials(
  reviews: CourseReview[],
): TestimonialItem[] {
  const items: TestimonialItem[] = [];

  for (const review of reviews) {
    const student =
      typeof review.student === "object" ? review.student : null;
    const courseTitle =
      typeof review.course === "object" ? review.course.title.trim() : "";
    const name =
      review.displayStudentName?.trim() ||
      [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() ||
      "Student";
    const quote = review.comment?.trim() || review.title?.trim() || "";
    if (!quote) continue;

    items.push({
      quote,
      name,
      role: courseTitle,
      avatar: student?.avatar?.trim() || undefined,
      rating: review.rating,
    });
  }

  return items;
}
