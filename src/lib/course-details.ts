import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';

export interface CourseDetailsData {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
  salePrice?: number;
  finalPrice: number;
  discountPercentage: number;
  enrollmentCount: number;
  lessonCount: number;
  totalDuration: number; // in minutes
  instructor?: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
    address?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
  };
  categoryInfo?: {
    name: string;
    color?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChapterWithLessons {
  _id: string;
  title: string;
  description?: string;
  order: number;
  course: string;
  isPublished: boolean;
  lessons: Array<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    chapter: string;
    course: string;
    duration?: number;
    type: 'video' | 'audio' | 'reading' | 'assignment';
    isPublished: boolean;
    videoUrl?: string;
    content?: string;
    isFree?: boolean;
  }>;
}

// Server-side function to get course by ID with caching
export async function getCourseById(courseId: string): Promise<CourseDetailsData | null> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    console.error('getCourseById called in browser');
    return null;
  }

  const getCachedCourse = unstable_cache(
    async () => {
      try {
        await connectDB();
        
        // Dynamic imports to prevent client-side bundling
        const CourseModule = (await import('@/models/Course')).default;
        const ChapterModule = (await import('@/models/Chapter')).default;
        const LessonModule = (await import('@/models/Lesson')).default;
        const CourseCategoryModule = (await import('@/models/CourseCategory')).default;
        const EnrollmentModule = (await import('@/models/Enrollment')).default;
        
        const Course = CourseModule;
        const Chapter = ChapterModule;
        const Lesson = LessonModule;
        const CourseCategory = CourseCategoryModule;
        const Enrollment = EnrollmentModule;
        
        if (!Course || !Chapter || !Lesson || !CourseCategory || !Enrollment) {
          console.error('Failed to import Mongoose models');
          return null;
        }
        
        // Validate courseId format
        if (!courseId || typeof courseId !== 'string') {
          console.error('Invalid courseId provided:', courseId);
          return null;
        }

        // Try to find course - first check if it exists at all
        const courseExists = await Course.findOne({ _id: courseId }).select('status title').lean();
        
        if (!courseExists) {
          console.warn(`Course not found in database: ${courseId}`);
          return null;
        }

        // Check if course is published
        if ((courseExists as any).status !== 'published') {
          console.warn(`Course found but not published: ${courseId}, status: ${(courseExists as any).status}, title: ${(courseExists as any).title}`);
          return null;
        }
        
        // Get published course with full details
        const course = await Course.findOne({ 
          _id: courseId, 
          status: 'published' 
        })
          .populate('createdBy', 'firstName lastName email phone address.fullAddress avatar')
          .populate('instructor', 'firstName lastName email avatar phone address.fullAddress')
          .lean();

        if (!course) {
          console.warn(`Course not found after status check: ${courseId}`);
          return null;
        }

        const courseData = course as any;

        // Get chapters for this course
        const chapters = await Chapter.find({ course: courseId }).lean();
        const chapterIds = chapters.map(ch => ch._id);
        
        // Get lessons for all chapters
        const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).lean();
        
        // Calculate lesson count and total duration
        const lessonCount = lessons.length;
        const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

        // Calculate final price
        const finalPrice = courseData.isPaid ? (courseData.salePrice || courseData.price || 0) : 0;
        const discountPercentage = courseData.isPaid && courseData.salePrice && courseData.price && courseData.salePrice < courseData.price 
          ? Math.round(((courseData.price - courseData.salePrice) / courseData.price) * 100) 
          : 0;

        // Get enrollment count
        const enrollmentCount = await Enrollment.countDocuments({
          course: courseId,
          status: { $in: ['enrolled', 'in_progress', 'completed'] }
        });

        // Get category info
        let categoryInfo = null;
        if (courseData.category) {
          const categoryDoc = await CourseCategory.findOne({ name: courseData.category }).lean();
          categoryInfo = categoryDoc && !Array.isArray(categoryDoc) ? {
            name: (categoryDoc as any).name,
            color: (categoryDoc as any).color
          } : null;
        }

        // Get instructor info
        const instructor = courseData.instructor || courseData.createdBy;
        const instructorName = instructor 
          ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email
          : 'Unknown Instructor';

        return {
          _id: courseData._id.toString(),
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          thumbnailUrl: courseData.thumbnailUrl,
          isPaid: courseData.isPaid,
          price: courseData.price,
          salePrice: courseData.salePrice,
          finalPrice,
          discountPercentage,
          enrollmentCount,
          lessonCount,
          totalDuration,
          instructor: {
            _id: instructor?._id?.toString() || '',
            name: instructorName,
            avatar: instructor?.avatar,
            phone: instructor?.phone || undefined,
            address: instructor?.address?.fullAddress || undefined,
          },
          createdBy: courseData.createdBy ? {
            _id: courseData.createdBy._id?.toString() || '',
            name: `${courseData.createdBy.firstName || ''} ${courseData.createdBy.lastName || ''}`.trim() || courseData.createdBy.email,
            email: courseData.createdBy.email,
          } : undefined,
          categoryInfo,
          createdAt: courseData.createdAt?.toISOString(),
          updatedAt: courseData.updatedAt?.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching course by ID:', error);
        return null;
      }
    },
    [`course-${courseId}`],
    {
      tags: [`course-${courseId}`, 'courses'],
      revalidate: 60, // Revalidate every 60 seconds
    }
  );

  return await getCachedCourse();
}

// Server-side function to get chapters and lessons for a course with caching
export async function getCourseChaptersAndLessons(courseId: string): Promise<ChapterWithLessons[]> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    console.error('getCourseChaptersAndLessons called in browser');
    return [];
  }

  const getCachedChaptersAndLessons = unstable_cache(
    async () => {
      try {
        await connectDB();

        // Dynamic imports to prevent client-side bundling
        const ChapterModule = await import('@/models/Chapter');
        const LessonModule = await import('@/models/Lesson');
        
        const Chapter = ChapterModule.default;
        const Lesson = LessonModule.default;
        
        if (!Chapter || !Lesson) {
          console.error('Failed to import Mongoose models');
          return [];
        }

        // Get all chapters for this course (including unpublished for now)
        // Note: You can filter by isPublished: true if you only want published content
        const chapters = await Chapter.find({
          course: courseId
        })
          .sort({ order: 1 })
          .lean();

        if (!chapters || chapters.length === 0) {
          return [];
        }

        const chapterIds = chapters.map(ch => ch._id);

        // Get all lessons for all chapters (including unpublished for now)
        // Note: You can filter by isPublished: true if you only want published content
        const lessons = await Lesson.find({
          chapter: { $in: chapterIds }
        })
          .sort({ order: 1 })
          .lean();

        // Group lessons by chapter
        const chaptersWithLessons: ChapterWithLessons[] = chapters.map((chapter: any) => {
          const chapterLessons = lessons
            .filter((lesson: any) => lesson.chapter.toString() === chapter._id.toString())
            .map((lesson: any) => ({
              _id: lesson._id.toString(),
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              chapter: lesson.chapter.toString(),
              course: lesson.course.toString(),
              duration: lesson.duration || 0,
              type: (lesson.type || 'video') as 'video' | 'audio' | 'reading' | 'assignment',
              isPublished: lesson.isPublished,
              videoUrl: lesson.videoUrl,
              content: lesson.content,
              isFree: lesson.isFree || false,
            }));

          return {
            _id: chapter._id.toString(),
            title: chapter.title,
            description: chapter.description,
            order: chapter.order,
            course: chapter.course.toString(),
            isPublished: chapter.isPublished,
            lessons: chapterLessons,
          };
        });

        return chaptersWithLessons;
      } catch (error) {
        console.error('Error fetching chapters and lessons:', error);
        return [];
      }
    },
    [`course-chapters-${courseId}`],
    {
      tags: [`course-${courseId}`, 'courses', 'chapters', 'lessons'],
      revalidate: 60, // Revalidate every 60 seconds
    }
  );

  return await getCachedChaptersAndLessons();
}
