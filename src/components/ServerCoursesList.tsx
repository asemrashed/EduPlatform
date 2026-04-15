import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseCategory from '@/models/CourseCategory';
import CoursesList from './CoursesList';
import { Course as CourseType } from '@/types/course';

async function getCourses(): Promise<CourseType[]> {
  try {
    await connectDB();

    const courses = await Course.find({ status: 'published', isHidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    const coursesWithCategories = await Promise.all(
      courses.map(async (course) => {
        const finalPrice = course.isPaid ? (course.salePrice || course.price || 0) : 0;
        const discountPercentage = course.isPaid && course.salePrice && course.price && course.salePrice < course.price 
          ? Math.round(((course.price - course.salePrice) / course.price) * 100) 
          : 0;

        const baseData: CourseType = {
          _id: String(course._id),
          title: course.title,
          description: course.description,
          category: course.category,
          thumbnailUrl: course.thumbnailUrl,
          isPaid: course.isPaid,
          status: course.status ?? 'draft',
          price: course.price,
          salePrice: course.salePrice,
          finalPrice,
          discountPercentage,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString()
        };
        
        if (course.category) {
          const categoryInfo = await CourseCategory.findOne({ name: course.category }).lean();
          return {
            ...baseData,
            categoryInfo: categoryInfo ? {
              _id: String((categoryInfo as any)._id),
              name: (categoryInfo as any).name,
              description: (categoryInfo as any).description,
              color: (categoryInfo as any).color,
              icon: (categoryInfo as any).icon,
              isActive: (categoryInfo as any).isActive
            } : null
          };
        }
        return {
          ...baseData,
          categoryInfo: null
        };
      })
    );

    return coursesWithCategories;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function ServerCoursesList() {
  const courses = await getCourses();
  return <CoursesList courses={courses} />;
}
