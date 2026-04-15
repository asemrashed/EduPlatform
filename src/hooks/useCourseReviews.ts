import { useState, useEffect } from 'react';

interface Review {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  course: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isPublic: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseReviewStats {
  courseId: string;
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  recentReviews: Review[];
}

export function useCourseReviews(courseIds: string[]) {
  const [reviewsData, setReviewsData] = useState<Record<string, CourseReviewStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewsForCourses = async () => {
    if (courseIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch reviews for all courses in parallel
      const reviewPromises = courseIds.map(async (courseId) => {
        try {
          // Try the course-specific reviews endpoint first (includes stats)
          let response = await fetch(`/api/courses/${courseId}/reviews?limit=10`);
          let useStatsEndpoint = response.ok;
          
          // Fallback to general reviews endpoint if course-specific fails
          if (!response.ok) {
            response = await fetch(`/api/course-reviews?course=${courseId}&limit=10`);
            useStatsEndpoint = false;
          }
          
          if (response.ok) {
            const data = await response.json();
            const reviews = data.data?.reviews || data.reviews || [];
            const stats = data.data?.stats || null;
            const pagination = data.data?.pagination || {};
            
            // Use stats if available (most accurate)
            let totalReviews = 0;
            let averageRating = 0;
            let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            
            if (stats) {
              // Use stats from API (accurate total count from database)
              totalReviews = stats.totalReviews || 0;
              averageRating = stats.averageRating || 0;
              ratingDistribution = stats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            } else if (pagination.total !== undefined && pagination.total !== null) {
              // Use pagination total (accurate count from database query)
              totalReviews = pagination.total || 0;
              // Calculate average from returned reviews
              const approvedReviews = reviews.filter((review: Review) => 
                review.isApproved && review.isPublic
              );
              if (approvedReviews.length > 0) {
                const totalRating = approvedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
                averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
                approvedReviews.forEach((review: Review) => {
                  if (review.rating >= 1 && review.rating <= 5) {
                    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
                  }
                });
              }
            } else {
              // Fallback: calculate from returned reviews (less accurate, only counts returned items)
              const approvedReviews = reviews.filter((review: Review) => 
                review.isApproved && review.isPublic
              );
              
              if (approvedReviews.length > 0) {
                totalReviews = approvedReviews.length;
                const totalRating = approvedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
                averageRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
                
                approvedReviews.forEach((review: Review) => {
                  if (review.rating >= 1 && review.rating <= 5) {
                    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
                  }
                });
              }
            }
            
            // Filter only approved and public reviews for recent reviews
            const approvedReviews = reviews.filter((review: Review) => 
              review.isApproved && review.isPublic
            );
            
            return {
              courseId,
              totalReviews,
              averageRating,
              ratingDistribution,
              recentReviews: approvedReviews.slice(0, 3) // Get 3 most recent reviews
            };
          } else {
            console.error(`Failed to fetch reviews for course ${courseId}:`, response.status);
            return {
              courseId,
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
              recentReviews: []
            };
          }
        } catch (error) {
          console.error(`Error fetching reviews for course ${courseId}:`, error);
          return {
            courseId,
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            recentReviews: []
          };
        }
      });

      const results = await Promise.all(reviewPromises);
      
      // Convert array to object for easy lookup
      const reviewsMap: Record<string, CourseReviewStats> = {};
      results.forEach(result => {
        reviewsMap[result.courseId] = result;
      });
      
      setReviewsData(reviewsMap);
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      setError('Failed to fetch course reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseIds.length > 0) {
      fetchReviewsForCourses();
    }
  }, [courseIds.join(',')]); // Re-fetch when course IDs change

  return {
    reviewsData,
    loading,
    error,
    refetch: fetchReviewsForCourses
  };
}
