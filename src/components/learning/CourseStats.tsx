'use client';

import { Course, CourseStats as CourseStatsType } from '@/types/course';
import { LuBookOpen as BookOpen, LuDollarSign as DollarSign, LuTag as Tag, LuTrendingUp as TrendingUp, LuAward as Award, LuPercent } from 'react-icons/lu';;

interface CourseStatsProps {
  courses: Course[];
  loading: boolean;
  stats?: CourseStatsType | null;
}

export default function CourseStats({ courses, loading, stats }: CourseStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalCourses = stats?.totalCourses || courses.length;
  const paidCourses = stats?.paidCourses || courses.filter(c => c.isPaid).length;
  const freeCourses = stats?.freeCourses || courses.filter(c => !c.isPaid).length;
  const totalRevenue = stats?.totalRevenue || 0;
  const averagePrice = stats?.averagePrice || 0;
  const categories = stats?.categories || {};

  const categoryCount = Object.keys(categories).length;
  const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];

  const statsData = [
    {
      title: 'Total Courses',
      value: totalCourses,
      icon: BookOpen,
      color: 'purple',
      bgColor: 'bg-purple-50/50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Paid Courses',
      value: paidCourses,
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'Free Courses',
      value: freeCourses,
      icon: Award,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div 
          key={index}
          className={`bg-white rounded-xl border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6 group`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
          <div className="mt-4">
            <div className={`h-1 ${stat.bgColor} rounded-full overflow-hidden`}>
              <div 
                className={`h-full ${stat.textColor.replace('text-', 'bg-')} rounded-full transition-all duration-1000`}
                style={{ 
                  width: stat.title === 'Total Revenue' 
                    ? '100%' 
                    : '100%' 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
