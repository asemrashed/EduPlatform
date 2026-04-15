import { notFound } from 'next/navigation';
import { getCourseById, getCourseChaptersAndLessons } from '@/lib/course-details';
import CourseDetails from '@/app/components/CourseDetails';

interface CourseDetailsWrapperProps {
  courseId: string;
}

export default async function CourseDetailsWrapper({ courseId }: CourseDetailsWrapperProps) {
  try {
    // Validate courseId format
    if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
      console.error(`Invalid course ID format: ${courseId}`);
      notFound();
    }

    // Basic MongoDB ObjectId format validation (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(courseId.trim())) {
      console.error(`Invalid MongoDB ObjectId format: ${courseId}`);
      notFound();
    }

    const trimmedCourseId = courseId.trim();
    
    // Fetch course data and chapters/lessons server-side with caching (with timeout fallback)
    const [course, chapters] = await Promise.race([
      Promise.all([
        getCourseById(trimmedCourseId),
        getCourseChaptersAndLessons(trimmedCourseId),
      ]),
      new Promise<[null, []]>((resolve) => 
        setTimeout(() => resolve([null, []]), 10000)
      )
    ]).catch((error) => {
      console.error('Error fetching course data:', error);
      return [null, []] as [null, []];
    });

    // Check if course exists
  if (!course) {
      console.error(`Course not found: ${trimmedCourseId}`);
    notFound();
  }

  // Pass courseId, course data, and chapters/lessons to CourseDetails component
    return <CourseDetails courseId={trimmedCourseId} initialCourse={course} initialChapters={chapters} />;
  } catch (error) {
    console.error('Error in CourseDetailsWrapper:', error);
    // Don't expose internal errors to users, just show 404
    notFound();
  }
}
