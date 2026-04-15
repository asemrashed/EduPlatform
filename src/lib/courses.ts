import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Chapter from '@/models/Chapter';
import Lesson from '@/models/Lesson';
import CourseCategory from '@/models/CourseCategory';
import User from '@/models/User';

const CACHE_TAG = 'courses';

export interface CourseWithStats {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
  salePrice?: number;
  finalPrice: number;
  discountPercentage: number;
  lessonCount: number;
  totalDuration: number; // in minutes
  instructor?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  categoryInfo?: {
    name: string;
    color?: string;
  } | null;
  rating?: string; // Will be calculated from reviews if available
}

// Server-side function to get courses with caching
export async function getCourses(limit: number = 8): Promise<CourseWithStats[]> {
  const getCachedCourses = unstable_cache(
    async () => {
      try {
        await connectDB();
        
        // Get published courses
        const courses = await Course.find({ status: 'published', isHidden: { $ne: true } })
          .populate('createdBy', 'firstName lastName email')
          .populate('instructor', 'firstName lastName email')
          .sort({ displayOrder: 1, createdAt: -1 })
          .limit(limit)
          .lean();

        // Get course stats (lesson count and duration) for each course
        const coursesWithStats = await Promise.all(
          courses.map(async (course: any) => {
            // Get chapters for this course
            const chapters = await Chapter.find({ course: course._id }).lean();
            const chapterIds = chapters.map(ch => ch._id);
            
            // Get lessons for all chapters
            const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).lean();
            
            // Calculate lesson count and total duration
            const lessonCount = lessons.length;
            const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
            
            // Get category info
            let categoryInfo = null;
            if (course.category) {
              const category = await CourseCategory.findOne({ name: course.category }).lean();
              categoryInfo = category && !Array.isArray(category) ? {
                name: (category as any).name,
                color: (category as any).color
              } : null;
            }
            
            // Calculate final price
            const finalPrice = course.isPaid ? (course.salePrice || course.price || 0) : 0;
            const discountPercentage = course.isPaid && course.salePrice && course.price && course.salePrice < course.price 
              ? Math.round(((course.price - course.salePrice) / course.price) * 100) 
              : 0;
            
            // Get instructor info
            const instructor = course.instructor || course.createdBy;
            const instructorName = instructor 
              ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email
              : 'Unknown Instructor';
            
            return {
              _id: course._id.toString(),
              title: course.title,
              description: course.description,
              category: course.category,
              thumbnailUrl: course.thumbnailUrl,
              isPaid: course.isPaid,
              price: course.price,
              salePrice: course.salePrice,
              finalPrice,
              discountPercentage,
              lessonCount,
              totalDuration,
              instructor: {
                _id: instructor?._id?.toString() || '',
                name: instructorName,
              },
              categoryInfo,
            };
          })
        );

        return coursesWithStats;
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    },
    ['homepage-courses'],
    {
      tags: [CACHE_TAG],
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedCourses();
}

// Server-side function to get courses by category with caching
export async function getCoursesByCategory(category?: string, limit: number = 100): Promise<CourseWithStats[]> {
  const cacheKey = category && category !== 'All' && category !== 'all' ? `courses-by-category-${category}` : 'courses-all';
  
  const getCachedCoursesByCategory = unstable_cache(
    async () => {
      try {
        await connectDB();
        
        // Build filter
        const filter: any = { status: 'published', isHidden: { $ne: true } };
        if (category && category !== 'All' && category !== 'all') {
          filter.category = category;
        }
        
        // Build query - use higher limit for "All" to show all courses
        const queryLimit = (category === 'All' || category === 'all' || !category) ? 1000 : limit;
        
        // Get published courses
        const courses = await Course.find(filter)
          .populate('createdBy', 'firstName lastName email')
          .populate('instructor', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(queryLimit)
          .lean();

        // Get course stats (lesson count and duration) for each course
        const coursesWithStats = await Promise.all(
          courses.map(async (course: any) => {
            // Get chapters for this course
            const chapters = await Chapter.find({ course: course._id }).lean();
            const chapterIds = chapters.map(ch => ch._id);
            
            // Get lessons for all chapters
            const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).lean();
            
            // Calculate lesson count and total duration
            const lessonCount = lessons.length;
            const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
            
            // Get category info
            let categoryInfo = null;
            if (course.category) {
              const categoryDoc = await CourseCategory.findOne({ name: course.category }).lean();
              categoryInfo = categoryDoc && !Array.isArray(categoryDoc) ? {
                name: (categoryDoc as any).name,
                color: (categoryDoc as any).color
              } : null;
            }
            
            // Calculate final price
            const finalPrice = course.isPaid ? (course.salePrice || course.price || 0) : 0;
            const discountPercentage = course.isPaid && course.salePrice && course.price && course.salePrice < course.price 
              ? Math.round(((course.price - course.salePrice) / course.price) * 100) 
              : 0;
            
            // Get instructor info
            const instructor = course.instructor || course.createdBy;
            const instructorName = instructor 
              ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email
              : 'Unknown Instructor';
            
            return {
              _id: course._id.toString(),
              title: course.title,
              description: course.description,
              category: course.category,
              thumbnailUrl: course.thumbnailUrl,
              isPaid: course.isPaid,
              price: course.price,
              salePrice: course.salePrice,
              finalPrice,
              discountPercentage,
              lessonCount,
              totalDuration,
              instructor: {
                _id: instructor?._id?.toString() || '',
                name: instructorName,
                avatar: instructor?.avatar,
              },
              categoryInfo,
            };
          })
        );

        return coursesWithStats;
      } catch (error) {
        console.error('Error fetching courses by category:', error);
        return [];
      }
    },
    [cacheKey],
    {
      tags: [CACHE_TAG],
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedCoursesByCategory();
}

// Server-side function to get courses by IDs (preserves order), with caching
export async function getCoursesByIds(ids: string[]): Promise<CourseWithStats[]> {
  if (!ids || ids.length === 0) return [];

  const cacheKey = `courses-by-ids-${ids.join(',')}`;
  const getCachedCoursesByIds = unstable_cache(
    async () => {
      try {
        await connectDB();
        const objectIds = ids.map((id) => id as any).filter(Boolean);
        const courses = await Course.find({
          _id: { $in: objectIds },
          status: 'published',
          isHidden: { $ne: true },
        })
          .populate('createdBy', 'firstName lastName email')
          .populate('instructor', 'firstName lastName email')
          .lean();

        const byId = new Map<string, any>();
        for (const c of courses) {
          byId.set((c as any)._id.toString(), c);
        }

        const coursesWithStats = await Promise.all(
          ids.map(async (id) => {
            const course = byId.get(id);
            if (!course) return null;
            const courseObj = course as any;
            const chapters = await Chapter.find({ course: courseObj._id }).lean();
            const chapterIds = chapters.map((ch: any) => ch._id);
            const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).lean();
            const lessonCount = lessons.length;
            const totalDuration = lessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0);
            let categoryInfo = null;
            if (courseObj.category) {
              const category = await CourseCategory.findOne({ name: courseObj.category }).lean();
              categoryInfo = category && !Array.isArray(category) ? {
                name: (category as any).name,
                color: (category as any).color
              } : null;
            }
            const finalPrice = courseObj.isPaid ? (courseObj.salePrice || courseObj.price || 0) : 0;
            const discountPercentage = courseObj.isPaid && courseObj.salePrice && courseObj.price && courseObj.salePrice < courseObj.price
              ? Math.round(((courseObj.price - courseObj.salePrice) / courseObj.price) * 100)
              : 0;
            const instructor = courseObj.instructor || courseObj.createdBy;
            const instructorName = instructor
              ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email
              : 'Unknown Instructor';
            return {
              _id: courseObj._id.toString(),
              title: courseObj.title,
              description: courseObj.description,
              category: courseObj.category,
              thumbnailUrl: courseObj.thumbnailUrl,
              isPaid: courseObj.isPaid,
              price: courseObj.price,
              salePrice: courseObj.salePrice,
              finalPrice,
              discountPercentage,
              lessonCount,
              totalDuration,
              instructor: {
                _id: instructor?._id?.toString() || '',
                name: instructorName,
              },
              categoryInfo,
            };
          })
        );

        return coursesWithStats.filter(Boolean) as CourseWithStats[];
      } catch (error) {
        console.error('Error fetching courses by IDs:', error);
        return [];
      }
    },
    [cacheKey],
    { tags: [CACHE_TAG], revalidate: false }
  );

  return await getCachedCoursesByIds();
}
