'use client';

import { Teacher } from '@/types/teacher';
import { LuUsers as Users, LuUserCheck as UserCheck, LuUserX as UserX, LuGraduationCap as GraduationCap } from 'react-icons/lu';;

interface TeacherStatsProps {
  teachers: Teacher[];
  loading?: boolean;
}

const TeacherStats = ({ teachers, loading = false }: TeacherStatsProps) => {
  const activeTeachers = teachers.filter(teacher => teacher.isActive).length;
  const inactiveTeachers = teachers.filter(teacher => !teacher.isActive).length;
  const totalTeachers = teachers.length;
  const teachersWithAddress = teachers.filter(teacher =>
    teacher.address &&
    teacher.address.fullAddress
  ).length;

  const stats = [
    {
      title: 'Total Teachers',
      value: totalTeachers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Teachers',
      value: activeTeachers,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'With Address',
      value: teachersWithAddress,
      icon: GraduationCap,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Active Rate',
      value: totalTeachers > 0 ? `${Math.round((activeTeachers / totalTeachers) * 100)}%` : '0%',
      icon: GraduationCap,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    }
  ];

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
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
                  width: stat.title === 'Active Rate' 
                    ? String(stat.value).replace('%', '') + '%' 
                    : '100%' 
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherStats;
