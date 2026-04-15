'use client';

import { Student } from '@/types/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LuUsers as Users, LuUserCheck as UserCheck, LuUserX as UserX, LuCalendar as Calendar, LuMail as Mail } from 'react-icons/lu';;

interface StudentStatsProps {
  students: Student[];
  loading: boolean;
}

export default function StudentStats({ students, loading }: StudentStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalStudents = students.length;
  const activeStudents = students.filter(student => student.isActive).length;
  const inactiveStudents = totalStudents - activeStudents;
  

  // Calculate students with parent phone numbers
  const studentsWithParentPhone = students.filter(student => student.parentPhone).length;

  // Calculate students with addresses
  const studentsWithAddress = students.filter(student =>
    student.address &&
    student.address.fullAddress
  ).length;

  // Calculate enrollment this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const enrolledThisMonth = students.filter(student => {
    const enrollmentDate = new Date(student.enrollmentDate || student.createdAt);
    return enrollmentDate.getMonth() === currentMonth && enrollmentDate.getFullYear() === currentYear;
  }).length;

  // Calculate total enrolled amount across all students
  const totalEnrolledAmount = students.reduce((sum, student) => sum + (student.totalEnrolledAmount || 0), 0);
  const totalEnrollments = students.reduce((sum, student) => sum + (student.enrollmentCount || 0), 0);

  const stats = [
    {
      title: 'Total Students',
      value: totalStudents,
      icon: Users,
      description: 'All registered students',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Active Students',
      value: activeStudents,
      icon: UserCheck,
      description: 'Currently active',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Total Enrolled',
      value: `$${totalEnrolledAmount.toFixed(2)}`,
      icon: Calendar,
      description: 'Total course payments',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Total Enrollments',
      value: totalEnrollments,
      icon: Mail,
      description: 'Course enrollments',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-100'
    },
    {
      title: 'Enrolled This Month',
      value: enrolledThisMonth,
      icon: Calendar,
      description: 'New enrollments',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
