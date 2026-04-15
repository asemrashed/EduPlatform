'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

const Charts = () => {
  const enrollmentData = [
    { day: 'Sun', enrollments: 12 },
    { day: 'Mon', enrollments: 19 },
    { day: 'Tue', enrollments: 30 },
    { day: 'Wed', enrollments: 50 },
    { day: 'Thu', enrollments: 35 },
    { day: 'Fri', enrollments: 25 },
    { day: 'Sat', enrollments: 18 }
  ];

  const studentsData = [
    { day: 'Sun', students: 150 },
    { day: 'Mon', students: 250 },
    { day: 'Tue', students: 350 },
    { day: 'Wed', students: 450 },
    { day: 'Thu', students: 300 },
    { day: 'Fri', students: 200 },
    { day: 'Sat', students: 180 }
  ];

  const coursesData = [
    { day: 'Sun', completed: 20, inProgress: 15, notStarted: 15 },
    { day: 'Mon', completed: 25, inProgress: 10, notStarted: 15 },
    { day: 'Tue', completed: 30, inProgress: 12, notStarted: 8 },
    { day: 'Wed', completed: 35, inProgress: 8, notStarted: 7 },
    { day: 'Thu', completed: 28, inProgress: 15, notStarted: 7 },
    { day: 'Fri', completed: 22, inProgress: 18, notStarted: 10 },
    { day: 'Sat', completed: 20, inProgress: 20, notStarted: 10 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Enrollment Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollments (this week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={enrollmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="enrollments" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Students Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Students (this week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={studentsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="students" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Courses Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Course Progress (this week)</h3>
        <p className="text-sm text-gray-600 mb-4">Total 50 Courses</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={coursesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" stackId="a" fill="#10b981" />
            <Bar dataKey="inProgress" stackId="a" fill="#f59e0b" />
            <Bar dataKey="notStarted" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
