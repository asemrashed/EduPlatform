import { getCourses, getCoursesByIds } from '@/lib/courses';
import { getCoursesContent } from '@/lib/website-content';
import Courses from '@/app/components/Courses';

export default async function CoursesWrapper() {
  const coursesContent = await getCoursesContent();
  const featuredIds = coursesContent?.featuredCourseIds;
  const courses =
    featuredIds && featuredIds.length > 0
      ? await getCoursesByIds(featuredIds)
      : await getCourses(8);

  return <Courses initialCourses={courses} initialContent={coursesContent} />;
}

