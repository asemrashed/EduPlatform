'use client';

import { LuLayoutDashboard, LuBookOpen as BookOpen, LuUsers as Users, LuMessageSquare as MessageSquare, LuStar as Star, LuSettings as Settings, LuLogOut, LuGraduationCap as GraduationCap, LuFileText as LuFileText, LuChartBar, LuCalendar as Calendar, LuBell, LuAward as Award, LuBookmark, LuClipboardList, LuUserCheck as UserCheck, LuTrendingUp as TrendingUp, LuCircleHelp as HelpCircle, LuShield as Shield, LuTag as Tag, LuLayers as Layers, LuPlay as PlayCircle, LuDollarSign as DollarSign, LuFileCheck, LuTarget as Target, LuDatabase, LuGlobe as Globe } from 'react-icons/lu';
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser } from '@/lib/slices/authSlice';
import { useCourses } from '@/hooks/useCourses';
import { useCourseCategories } from '@/hooks/useCourseCategories';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useEnrollments } from '@/hooks/useEnrollments';
import { usePassPapers } from '@/hooks/usePassPapers';
import { useExams } from '@/hooks/useExams';
import { useAssignments } from '@/hooks/useAssignments';
import { useEffect, useState } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';



const AppSidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [branding, setBranding] = useState({
    logoText: 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦',
    logoTextColor1: '#7B2CBF',
    logoUrl: '',
  });

  // Fetch data for dynamic badges
  const { courses } = useCourses();
  const { categories } = useCourseCategories();
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { enrollments } = useEnrollments();
  const { passPapers } = usePassPapers();
  const { exams } = useExams();
  const { assignments } = useAssignments();

  // State for dynamic badges
  const [badges, setBadges] = useState({
    courses: 0,
    categories: 0,
    students: 0,
    teachers: 0,
    enrollments: 0,
    passPapers: 0,
    exams: 0,
    assignments: 0,
  });

  // Check if any data is still loading
  const isDataLoading = courses === undefined || categories === undefined || students === undefined || teachers === undefined || enrollments === undefined || passPapers === undefined || exams === undefined || assignments === undefined;

  // Update badges when data changes
  useEffect(() => {
    if (!isDataLoading) {
      setBadges({
        courses: courses?.length || 0,
        categories: categories?.length || 0,
        students: students?.length || 0,
        teachers: teachers?.length || 0,
        enrollments: enrollments?.length || 0,
        passPapers: passPapers?.length || 0,
        exams: exams?.length || 0,
        assignments: assignments?.length || 0,
      });
    }
  }, [courses, categories, students, teachers, enrollments, passPapers, exams, assignments, isDataLoading]);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/website-content', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const apiBranding = data?.data?.branding;
        if (!apiBranding) return;

        setBranding((prev) => ({
          ...prev,
          logoText: apiBranding.logoText || prev.logoText,
          logoTextColor1: apiBranding.logoTextColor1 || prev.logoTextColor1,
          logoUrl: apiBranding.logoUrl || '',
        }));
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };

    fetchBranding();
  }, []);

  const menuItems = [
    {
      category: 'Main',
      items: [
        { 
          icon: LuLayoutDashboard, 
          label: 'Dashboard', 
          href: '/admin/dashboard',
          description: 'Overview & insights',
          badge: null
        },
        // { 
        //   icon: Calendar, 
        //   label: 'Schedule', 
        //   href: '/admin/schedule',
        //   description: 'Classes & events',
        //   badge: '2'
        // },
        // { 
        //   icon: LuBell, 
        //   label: 'Notifications', 
        //   href: '/admin/notifications',
        //   description: 'Alerts & updates',
        //   badge: '5'
        // },
      ]
    },
    {
      category: 'Learning',
      items: [
        { 
          icon: BookOpen, 
          label: 'Courses', 
          href: '/admin/courses',
          description: 'Manage courses & content',
          badge: !isDataLoading && badges.courses > 0 ? badges.courses.toString() : null
        },
        { 
          icon: Tag, 
          label: 'Categories', 
          href: '/admin/categories',
          description: 'Course categories',
          badge: !isDataLoading && badges.categories > 0 ? badges.categories.toString() : null
        },
        // { 
        //   icon: Layers, 
        //   label: 'Chapters', 
        //   href: '/admin/chapters',
        //   description: 'Course chapters',
        //   badge: null
        // },
        // { 
        //   icon: PlayCircle, 
        //   label: 'Lessons', 
        //   href: '/admin/lessons',
        //   description: 'Course lessons',
        //   badge: null
        // },
        { 
          icon: LuFileText, 
          label: 'Assignments', 
          href: '/admin/assignments',
          description: 'Tasks & projects',
          badge: !isDataLoading && badges.assignments > 0 ? badges.assignments.toString() : null
        },
        // { 
        //   icon: Award, 
        //   label: 'Certificates', 
        //   href: '/admin/certificates',
        //   description: 'Course certificates',
        //   badge: null
        // },
        { 
          icon: LuBookmark, 
          label: 'Pass Papers', 
          href: '/admin/pass-papers',
          description: 'Question papers & solutions',
          badge: !isDataLoading && badges.passPapers > 0 ? badges.passPapers.toString() : null
        },
        { 
          icon: LuFileCheck, 
          label: 'Exams', 
          href: '/admin/exams',
          description: 'Create & manage exams',
          badge: !isDataLoading && badges.exams > 0 ? badges.exams.toString() : null
        },
        { 
          icon: LuDatabase, 
          label: 'Question Bank', 
          href: '/admin/question-bank',
          description: 'Manage question library',
          badge: null
        },
        // { 
        //   icon: Award, 
        //   label: 'Certificates', 
        //   href: '/admin/certificates',
        //   description: 'Achievements',
        //   badge: null
        // },
      ]
    },
    {
      category: 'People',
      items: [
        { 
          icon: Users, 
          label: 'Students', 
          href: '/admin/students',
          description: 'Student management',
          badge: !isDataLoading && badges.students > 0 ? badges.students.toString() : null
        },
        { 
          icon: GraduationCap, 
          label: 'Teachers', 
          href: '/admin/teachers',
          description: 'Instructor management',
          badge: !isDataLoading && badges.teachers > 0 ? badges.teachers.toString() : null
        },
        { 
          icon: UserCheck, 
          label: 'Enrollments', 
          href: '/admin/enrollments',
          description: 'Student course enrollments',
          badge: !isDataLoading && badges.enrollments > 0 ? badges.enrollments.toString() : null
        },
        // { 
        //   icon: DollarSign, 
        //   label: 'Refunds', 
        //   href: '/admin/refunds',
        //   description: 'Payment refunds & processing',
        //   badge: null
        // },
      ]
    },
    {
      category: 'Communication',
      items: [
        { 
          icon: Star, 
          label: 'Reviews', 
          href: '/admin/reviews',
          description: 'Feedback & ratings',
          badge: null
        },
        { 
          icon: HelpCircle, 
          label: 'Course FAQ', 
          href: '/admin/faq',
          description: 'Course-based FAQs',
          badge: null
        },
        // { 
        //   icon: MessageSquare, 
        //   label: 'Messages', 
        //   href: '/admin/messages',
        //   description: 'Direct messages',
        //   badge: '3'
        // },
        // { 
        //   icon: HelpCircle, 
        //   label: 'Support', 
        //   href: '/admin/support',
        //   description: 'Help & tickets',
        //   badge: '4'
        // },
      ]
    },
    // {
    //   category: 'Analytics',
    //   items: [
    //     { 
    //       icon: LuChartBar, 
    //       label: 'Analytics', 
    //       href: '/admin/analytics',
    //       description: 'Performance metrics',
    //       badge: null
    //     },
    //     { 
    //       icon: TrendingUp, 
    //       label: 'Reports', 
    //       href: '/admin/reports',
    //       description: 'Detailed reports',
    //       badge: null
    //     },
    //   ]
    // },
    {
      category: 'System',
      items: [
        { 
          icon: Globe, 
          label: 'Website Content', 
          href: '/admin/website-content',
          description: 'Manage header & content',
          badge: null
        },
      ]
    }
  ];

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    // Special handling for course builder
    if (href === '/admin/courses' && pathname.startsWith('/admin/courses/builder')) {
      return true;
    }
    // Special handling for enrollments
    if (href === '/admin/enrollments') {
      return pathname.startsWith('/admin/enrollments');
    }
    // Special handling for refunds
    if (href === '/admin/refunds') {
      return pathname.startsWith('/admin/refunds');
    }
    // Special handling for question bank
    if (href === '/admin/question-bank') {
      return pathname.startsWith('/admin/question-bank');
    }
    // Special handling for assignments
    if (href === '/admin/assignments') {
      return pathname.startsWith('/admin/assignments');
    }
    // Special handling for website content
    if (href === '/admin/website-content') {
      return pathname.startsWith('/admin/website-content');
    }
    // Special handling for course FAQ
    if (href === '/admin/faq') {
      return pathname.startsWith('/admin/faq');
    }
    // Special handling for settings
    if (href === '/admin/settings') {
      return pathname.startsWith('/admin/settings');
    }
    if (href === '/instructor/settings') {
      return pathname.startsWith('/instructor/settings');
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      console.log('You have been logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    if (user?.role) {
      return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
    return 'User';
  };

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      className="relative border-r w-full sm:w-80 border-b sm:border-b-0 transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(123, 44, 191, 0.2)',
      }}
    >


      <SidebarHeader className="rounded-b-2xl transition-all duration-300" style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(123, 44, 191, 0.2)',
      }}>
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.logoText || 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦ logo'}
                className="h-9 w-9 rounded object-contain bg-white"
              />
            ) : (
              <div className="h-9 w-9 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                {branding.logoText?.charAt(0) || 'I'}
              </div>
            )}
            <span
              className="truncate font-semibold text-base"
              style={{ color: branding.logoTextColor1 }}
            >
              {branding.logoText || 'à¦®à§à¦¨à¦¾à¦®à¦¤à¦¿ à¦¸à¦¾à¦°à§à¦­à§ à¦à§à¦à¦¨à¦¿à¦à§à¦¯à¦¾à¦² à¦à§à¦°à§à¦¨à¦¿à¦ à¦à¦¨à¦¸à§à¦à¦¿à¦à¦¿à¦à¦'}
            </span>
          </div>

         
        </div>
      </SidebarHeader>
      
      <SidebarContent className="admin-sidebar-content" style={{ backgroundColor: '#FFFFFF' }}>
        {menuItems.map((category, categoryIndex) => (
          <SidebarGroup key={categoryIndex} className="mb-4 last:mb-0">
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider mb-3 px-4 hidden sm:block" style={{ color: 'rgba(123, 44, 191, 0.6)' }}>
              {category.category}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {category.items.map((item, itemIndex) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={itemIndex}>
                      <SidebarMenuButton 
                        isActive={active}
                        tooltip={item.label}
                        onClick={() => item.href && router.push(item.href)}
                        className="group relative transition-all duration-200 rounded-lg cursor-pointer py-3 px-3"
                        style={active ? {
                          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                          borderLeft: '4px solid #A855F7',
                          color: '#EC4899',
                        } : {
                          color: '#6B7280',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                            e.currentTarget.style.color = '#7B2CBF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6B7280';
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0" style={{
                            color: active ? '#EC4899' : '#9CA3AF',
                          }}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className="font-medium text-sm truncate" style={{
                              color: active ? '#EC4899' : '#374151',
                            }}>{item.label}</span>
                            {item.badge && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white rounded-full min-w-[1.25rem] h-5 flex items-center justify-center" style={{
                                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                              }}>
                                {item.badge}
                              </span>
                            )}
                            {isDataLoading && !item.badge && (
                              <span className="ml-2 w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)' }}></span>
                            )}
                          </div>
                        </div>
                        
                        {/* Active state glow effect */}
                        {active && (
                          <div className="absolute inset-0 rounded-lg" style={{
                            background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%)",
                          }} />
                        )}
                        
                        {/* Active state indicator dot */}
                        {active && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="rounded-t-2xl transition-all duration-300" style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(123, 44, 191, 0.2)',
      }}>
        <div className="p-4">
          {/* Action Buttons */}
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Settings"
                onClick={() => router.push(user?.role === 'instructor' ? '/instructor/settings' : '/admin/settings')}
                className="group relative transition-all duration-200 rounded-lg"
                style={(pathname.startsWith('/admin/settings') || pathname.startsWith('/instructor/settings')) ? {
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                  borderLeft: '4px solid #A855F7',
                  color: '#EC4899',
                } : {
                  color: '#6B7280',
                }}
                onMouseEnter={(e) => {
                  if (!pathname.startsWith('/admin/settings') && !pathname.startsWith('/instructor/settings')) {
                    e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                    e.currentTarget.style.color = '#7B2CBF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pathname.startsWith('/admin/settings') && !pathname.startsWith('/instructor/settings')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0" style={{
                    color: (pathname.startsWith('/admin/settings') || pathname.startsWith('/instructor/settings')) ? '#EC4899' : '#9CA3AF',
                  }}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm" style={{
                    color: (pathname.startsWith('/admin/settings') || pathname.startsWith('/instructor/settings')) ? '#EC4899' : '#374151',
                  }}>Settings</span>
                </div>
                
                {/* Active state glow effect */}
                {(pathname.startsWith('/admin/settings') || pathname.startsWith('/instructor/settings')) && (
                  <div className="absolute inset-0 rounded-lg" style={{
                    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, transparent 100%)",
                  }} />
                )}
                
                {/* Active state indicator dot */}
                {(pathname.startsWith('/admin/settings') || pathname.startsWith('/instructor/settings')) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Logout" 
                onClick={handleLogout}
                disabled={isLoading}
                className="group relative transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: '#EF4444',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#F87171';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#EF4444';
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0" style={{
                    color: isLoading ? 'rgba(239, 68, 68, 0.5)' : '#EF4444',
                  }}>
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        borderTopColor: '#EF4444',
                      }}></div>
                    ) : (
                      <LuLogOut className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-medium text-sm">
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
