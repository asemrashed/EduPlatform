import { unstable_cache } from 'next/cache';
import connectDB from '@/lib/mongodb';
import CourseCategory from '@/models/CourseCategory';

const CACHE_TAG = 'categories';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
}

// Server-side function to get active categories with caching
export async function getActiveCategories(): Promise<Category[]> {
  const getCachedCategories = unstable_cache(
    async () => {
      try {
        await connectDB();
        const categories = await CourseCategory.find({ isActive: true })
          .sort({ name: 1 })
          .lean();
        
        return categories.map((cat: any) => ({
          _id: cat._id?.toString() || '',
          name: cat.name,
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          isActive: cat.isActive,
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    ['active-categories'],
    {
      tags: [CACHE_TAG],
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedCategories();
}

