'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

interface TrendData {
  _id: string;
  count: number;
}

interface DashboardData {
  trends: {
    enrollments: TrendData[];
    completions: TrendData[];
  };
  courseStats: Array<{
    id: string;
    title: string;
    enrollmentCount: number;
    completionRate: number;
  }>;
  paymentStats: {
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    successRate: number;
  };
}

interface DynamicChartsProps {
  data?: DashboardData;
  loading?: boolean;
}

const DynamicCharts = ({ data, loading = false }: DynamicChartsProps) => {
  const [activeChart, setActiveChart] = useState<'enrollments' | 'completions' | 'courses' | 'payments'>('enrollments');

  const formatChartData = () => {
    if (!data) return { enrollments: [], completions: [], courses: [], payments: [] };

    // Format enrollment trends
    const enrollmentData = data.trends.enrollments.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      enrollments: item.count
    }));

    // Format completion trends
    const completionData = data.trends.completions.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      completions: item.count
    }));

    // Format course data
    const courseData = data.courseStats.slice(0, 5).map(course => ({
      name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
      enrollments: course.enrollmentCount,
      completionRate: course.completionRate
    }));

    // Format payment data
    const paymentData = [
      { name: 'Successful', value: data.paymentStats.successfulPayments, color: '#10b981' },
      { name: 'Pending', value: data.paymentStats.pendingPayments, color: '#f59e0b' },
      { name: 'Failed', value: data.paymentStats.failedPayments, color: '#ef4444' }
    ];

    return { enrollmentData, completionData, courseData, paymentData };
  };

  const chartData = formatChartData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'enrollments', label: 'Enrollments', icon: '📈' },
          { key: 'completions', label: 'Completions', icon: '✅' },
          { key: 'courses', label: 'Top Courses', icon: '📚' },
          { key: 'payments', label: 'Payments', icon: '💳' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeChart === key
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
        {/* Enrollments Chart */}
        {activeChart === 'enrollments' && (
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Completions Chart */}
        {activeChart === 'completions' && (
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Completion Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Courses Chart */}
        {activeChart === 'courses' && (
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Courses by Enrollment</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.courseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="enrollments" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment Status Chart */}
        {activeChart === 'payments' && (
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.paymentData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${data?.paymentStats.totalRevenue.toLocaleString() || '0'}
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.paymentStats.successRate || 0}%
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-purple-900">Total Transactions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data?.paymentStats.totalTransactions || 0}
                </p>
              </div>
              <div className="text-2xl">🔄</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default DynamicCharts;
