"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DynamicKPICards from "@/components/dashboard/lp/DynamicKPICards";
import AdvancedApexCharts from "@/components/dashboard/lp/AdvancedApexCharts";
import Leaderboard from "@/components/dashboard/lp/Leaderboard";
import RecentActivities from "@/components/dashboard/lp/RecentActivities";
import PageSection from "@/components/dashboard/lp/PageSection";
import PageGrid from "@/components/dashboard/lp/PageGrid";
import WelcomeSection from "@/components/dashboard/lp/WelcomeSection";
import {
  LuRefreshCw as RefreshCw,
  LuTrendingUp as TrendingUp,
  LuUsers as Users,
  LuBookOpen as BookOpen,
  LuDollarSign as DollarSign,
} from "react-icons/lu";
import type { AdminDashboardApiPayload } from "@/types/dashboard";
// import Header from "@/components/Header";

export interface AdminDashboardParityProps {
  dashboardData: AdminDashboardApiPayload | null;
  loading: boolean;
  onRefresh: () => void | Promise<void>;
}

export function AdminDashboardParity({
  dashboardData,
  loading,
  onRefresh,
}: AdminDashboardParityProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (dashboardData) setLastUpdated(new Date());
  }, [dashboardData]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      await onRefreshRef.current();
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void (async () => {
        try {
          setRefreshing(true);
          await onRefreshRef.current();
          setLastUpdated(new Date());
        } finally {
          setRefreshing(false);
        }
      })();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    void fetchDashboardData(true);
  };

  return (
      <main className="relative z-10 p-2 sm:p-4">
        {/* Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <WelcomeSection 
              title="Admin Dashboard"
              description="Comprehensive analytics and management overview"
            />
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>Auto-refresh</span>
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                }
              }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <PageSection 
          title="LuKey Performance Indicators"
          description="Real-time metrics and performance analytics"
          className="mb-8"
        >
          <DynamicKPICards data={dashboardData || undefined} loading={loading} />
        </PageSection>

        {/* Main Content Grid */}
        <PageGrid 
          columns={3} 
          gap="md"
          className="mb-6"
        >
          {/* Left Column - Charts */}
          <div className="xl:col-span-2 flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Analytics Dashboard"
              className="flex-1"
            >
              <AdvancedApexCharts data={dashboardData || undefined} loading={loading} />
            </PageSection>
          </div>
          
          {/* Right Column - Leaderboard and Activities */}
          <div className="flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Top Performers"
              className="shrink-0"
            >
              <Leaderboard 
                data={dashboardData?.leaderboard || []} 
                loading={loading} 
              />
            </PageSection>
            
            <PageSection 
              title="Recent Activities"
              className="flex-1"
            >
              <RecentActivities 
                recentEnrollments={dashboardData?.recentEnrollments || []}
                loading={loading} 
              />
            </PageSection>
          </div>
        </PageGrid>
        
        {/* Course Statistics */}
        <PageSection 
          title="Course Performance"
          description="Top performing courses and statistics"
          className="mb-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Courses by Enrollment</h4>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.courseStats?.slice(0, 5).map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <h5 className="font-medium text-gray-900">{course.title}</h5>
                        <p className="text-sm text-gray-500">Completion Rate: {course.completionRate}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: '#7B2CBF' }}>{course.enrollmentCount}</p>
                        <p className="text-xs text-gray-500">enrollments</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Statistics</h4>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Total Revenue</span>
                    </div>
                    <span className="font-bold text-green-600">
                      ${dashboardData?.paymentStats?.totalRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 44, 191, 0.1)' }}>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" style={{ color: '#7B2CBF' }} />
                      <span className="font-medium" style={{ color: '#7B2CBF' }}>Success Rate</span>
                    </div>
                    <span className="font-bold" style={{ color: '#7B2CBF' }}>
                      {dashboardData?.paymentStats?.successRate || 0}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" style={{ color: '#A855F7' }} />
                      <span className="font-medium" style={{ color: '#A855F7' }}>Total Transactions</span>
                    </div>
                    <span className="font-bold" style={{ color: '#A855F7' }}>
                      {dashboardData?.paymentStats?.totalTransactions || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" style={{ color: '#FF6B35' }} />
                      <span className="font-medium" style={{ color: '#FF6B35' }}>Successful Payments</span>
                    </div>
                    <span className="font-bold" style={{ color: '#FF6B35' }}>
                      {dashboardData?.paymentStats?.successfulPayments || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PageSection>

        {/* Quick Actions */}
        <PageSection 
          title="Quick Actions"
          description="Common administrative tasks"
          className="mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/courses" className="p-4 text-white rounded-lg transition-all duration-200 text-center" style={{
              background: "linear-gradient(135deg, #7B2CBF 0%, #A855F7 100%)",
              boxShadow: "0 4px 15px rgba(123, 44, 191, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(123, 44, 191, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #7B2CBF 0%, #A855F7 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(123, 44, 191, 0.3)";
            }}>
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium">Manage Courses</div>
            </Link>
            <Link href="/admin/students" className="p-4 text-white rounded-lg transition-all duration-200 text-center" style={{
              background: "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #0D9488 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
            }}>
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium">Manage Students</div>
            </Link>
            <Link href="/admin/teachers" className="p-4 text-white rounded-lg transition-all duration-200 text-center" style={{
              background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
            }}>
              <div className="text-2xl mb-2">👨‍🏫</div>
              <div className="text-sm font-medium">Manage Teachers</div>
            </Link>
            <Link href="/admin/reviews" className="p-4 text-white rounded-lg transition-all duration-200 text-center" style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
              boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #D97706 0%, #EA580C 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(245, 158, 11, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(245, 158, 11, 0.3)";
            }}>
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm font-medium">Manage Reviews</div>
            </Link>
            <Link href="/admin/settings" className="p-4 text-white rounded-lg transition-all duration-200 text-center" style={{
              background: "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)",
              boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #E55A2B 0%, #E67E4A 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #FF6B35 0%, #FF8C5A 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 107, 53, 0.3)";
            }}>
              <div className="text-2xl mb-2">⚙️</div>
              <div className="text-sm font-medium">System Settings</div>
            </Link>
          </div>
        </PageSection>
      </main>
  );
}