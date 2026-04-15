import { getCoursesByCategoryContent } from '@/lib/website-content';
import { getActiveCategories } from '@/lib/categories';
import { getCoursesByCategory } from '@/lib/courses';
import CoursesByCategory from '@/app/components/CoursesByCategory';

export default async function CoursesByCategoryWrapper() {
  // Fetch CMS content, categories, and initial courses (All) server-side with caching
  const [coursesByCategoryContent, categories, initialCourses] = await Promise.all([
    getCoursesByCategoryContent(),
    getActiveCategories(),
    getCoursesByCategory('All', 1000), // Fetch all courses initially (high limit to show all)
  ]);
  
  // Pass all as props to avoid client-side flash
  return (
    <CoursesByCategory 
      initialContent={coursesByCategoryContent} 
      initialCategories={categories}
      initialCourses={initialCourses}
    />
  );
}

