'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TrendData {
  _id: string;
  count: number;
}

interface DashboardData {
  trends: {
    enrollments: TrendData[];
    completions: TrendData[];
    revenue?: Array<{ _id: string; total: number }>; // YYYY-MM, total amount
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

interface ApexChartsProps {
  data?: DashboardData;
  loading?: boolean;
}

const ApexCharts = ({ data, loading = false }: ApexChartsProps) => {
  const [activeChart, setActiveChart] = useState<'enrollments' | 'completions' | 'courses' | 'payments'>('enrollments');

  const formatChartData = () => {
    if (!data) return { 
      enrollmentData: [], 
      completionData: [], 
      courseData: [], 
      paymentData: [] 
    };

    // Format enrollment trends
    const enrollmentData = data.trends.enrollments.map(item => ({
      x: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      y: item.count
    }));

    // Format completion trends
    const completionData = data.trends.completions.map(item => ({
      x: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      y: item.count
    }));

    // Format course data
    const courseData = data.courseStats.slice(0, 5).map(course => ({
      x: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
      y: course.enrollmentCount
    }));

    // Format payment data
    const paymentData = [
      { x: 'Successful', y: data.paymentStats.successfulPayments, color: '#10b981' },
      { x: 'Pending', y: data.paymentStats.pendingPayments, color: '#f59e0b' },
      { x: 'Failed', y: data.paymentStats.failedPayments, color: '#ef4444' }
    ];

    return { 
      enrollmentData: enrollmentData || [], 
      completionData: completionData || [], 
      courseData: courseData || [], 
      paymentData: paymentData || [] 
    };
  };

  const chartData = formatChartData();

  // Chart configurations
  const enrollmentOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.2,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: '#3b82f6', opacity: 1 },
          { offset: 100, color: '#1d4ed8', opacity: 0.2 }
        ]
      }
    },
    colors: ['#3b82f6'],
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      }
    }
  };

  const completionOptions = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#10b981'],
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: ['#10b981'],
      fillColors: ['#ffffff']
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      }
    }
  };

  const courseOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#8b5cf6'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true
      }
    },
    xaxis: {
      type: 'numeric',
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      }
    }
  };

  const paymentOptions = {
    chart: {
      type: 'donut',
      height: 300,
      toolbar: {
        show: true,
        tools: {
          download: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    labels: chartData.paymentData.map(item => item.x),
    dataLabels: {
      enabled: true,
      formatter: function (val: string, opts: any) {
        const label = opts.w.globals.labels[opts.seriesIndex];
        return label + ' (' + Math.round(Number(val)) + '%)'
      }
    },
    colors: ['#10b981', '#f59e0b', '#ef4444'],
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#6b7280'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
              }
            }
          }
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function(val: number, opts: any) {
          const count = opts.w.config.series[opts.seriesIndex];
          const label = opts.w.globals.labels[opts.seriesIndex];
          return count + ' ' + label;
        }
      }
    }
  };

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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Enrollment Trends (Last 7 Days)</h3>
            <Chart
              options={enrollmentOptions as any}
              series={[{ name: 'Enrollments', data: chartData.enrollmentData }]}
              type="area"
              height={300}
            />
          </div>
        )}

        {/* Completions Chart */}
        {activeChart === 'completions' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Completion Trends (Last 7 Days)</h3>
            <Chart
              options={completionOptions as any}
              series={[{ name: 'Completions', data: chartData.completionData }]}
              type="area"
              height={300}
            />
          </div>
        )}

        {/* Top Courses Chart */}
        {activeChart === 'courses' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Courses by Enrollment</h3>
            <Chart
              options={courseOptions as any}
              series={[{ name: 'Enrollments', data: chartData.courseData }]}
              type="bar"
              height={300}
            />
          </div>
        )}

        {/* Payment Status Chart */}
        {activeChart === 'payments' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status Distribution</h3>
            <Chart
              options={paymentOptions as any}
              series={chartData.paymentData.map(item => item.y)}
              type="donut"
              height={300}
            />
          </div>
        )}

        {/* Quick Stats removed per request */}
      </div>
    </div>
  );
};

export default ApexCharts;
