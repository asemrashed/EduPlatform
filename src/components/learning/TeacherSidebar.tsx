'use client';

import { LuLayoutDashboard, LuBookOpen as BookOpen, LuUsers as Users, LuCalendar as Calendar, LuBell, LuAward as Award, LuBookmark, LuClipboardList, LuUserCheck as UserCheck, LuTrendingUp as TrendingUp, LuCircle as HelpCircle, LuSettings as Settings, LuLogOut, LuPlay as PlayCircle, LuFileText as LuFileText, LuTarget as Target, LuUser as User, LuChartBar, LuGraduationCap as GraduationCap, LuStar as Star, LuMessageSquare as MessageSquare, LuPlus as Plus } from 'react-icons/lu';;
import { useRouter, usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logoutUser, checkAuthStatus } from '@/lib/slices/authSlice';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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

const TeacherSidebar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { data: session, status } = useSession();
  
  // Debug user role (remove in production)
  console.log('TeacherSidebar - User data:', {
    user,
    userRole: user?.role,
    isLoading,
    session,
    sessionStatus: status,
    sessionUser: session?.user
  });

  // Check auth status on mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      console.log('User authenticated, checking role:', session.user.role);
      if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
        console.log('User role not authorized for instructor routes:', session.user.role);
        router.push('/unauthorized');
      }
    }
  }, [status, session, router]);

  const menuItems = [
    {
      category: 'Main',
      items: [
        { 
          icon: LuLayoutDashboard, 
          label: 'Dashboard', 
          href: '/instructor/dashboard',
          description: 'Overview & analytics',
          badge: null
        },
        // { 
        //   icon: Calendar, 
        //   label: 'Schedule', 
        //   href: '/instructor/schedule',
        //   description: 'Classes & events',
        //   badge: null
        // },
        // { 
        //   icon: LuBell, 
        //   label: 'Notifications', 
        //   href: '/instructor/notifications',
        //   description: 'Alerts & updates',
        //   badge: '5'
        // },
      ]
    },
    {
      category: 'Teaching',
      items: [
        { 
          icon: BookOpen, 
          label: 'My Courses', 
          href: '/instructor/courses',
          description: 'Manage your courses',
          badge: null
        },
        // { 
        //   icon: Plus, 
        //   label: 'Create Course', 
        //   href: '/instructor/courses/create',
        //   description: 'Add new course',
        //   badge: null
        // },
        { 
          icon: Users, 
          label: 'Students', 
          href: '/instructor/students',
          description: 'Manage students',
          badge: null
        },
        { 
          icon: LuFileText, 
          label: 'Assignments', 
          href: '/instructor/assignments',
          description: 'Create & grade assignments',
          badge: '3'
        },
        { 
          icon: LuBookmark, 
          label: 'Pass Papers', 
          href: '/instructor/pass-papers',
          description: 'Question papers',
          badge: null
        },
        { 
          icon: LuFileText, 
          label: 'Question Bank', 
          href: '/instructor/question-bank',
          description: 'Manage your question bank',
          badge: null
        },
        { 
          icon: Target, 
          label: 'Exams', 
          href: '/instructor/exams',
          description: 'Create & manage exams',
          badge: null
        },
        { 
          icon: User, 
          label: 'Enrollments', 
          href: '/instructor/enrollments',
          description: 'Manage student enrollments',
          badge: null
        },
        { 
          icon: Star, 
          label: 'Reviews', 
          href: '/instructor/reviews',
          description: 'Course reviews & feedback',
          badge: null
        },
        // { 
        //   icon: Award, 
        //   label: 'Certificates', 
        //   href: '/instructor/certificates',
        //   description: 'Issue certificates',
        //   badge: null
        // },
      ]
    },
    // {
    //   category: 'Analytics',
    //   items: [
    //     { 
    //       icon: LuChartBar, 
    //       label: 'Analytics', 
    //       href: '/instructor/analytics',
    //       description: 'Teaching analytics',
    //       badge: null
    //     },
    //     { 
    //       icon: TrendingUp, 
    //       label: 'Performance', 
    //       href: '/instructor/performance',
    //       description: 'Track performance',
    //       badge: null
    //     },
    //     { 
    //       icon: Star, 
    //       label: 'Reviews', 
    //       href: '/instructor/reviews',
    //       description: 'Student feedback',
    //       badge: null
    //     },
    //   ]
    // },
    // {
    //   category: 'Communication',
    //   items: [
    //     { 
    //       icon: MessageSquare, 
    //       label: 'Messages', 
    //       href: '/instructor/messages',
    //       description: 'Student communication',
    //       badge: '2'
    //     },
    //     { 
    //       icon: UserCheck, 
    //       label: 'Attendance', 
    //       href: '/instructor/attendance',
    //       description: 'Track attendance',
    //       badge: null
    //     },
    //   ]
    // },
    {
      category: 'Account',
      items: [
        { 
          icon: GraduationCap, 
          label: 'Profile', 
          href: '/instructor/profile',
          description: 'Personal information',
          badge: null
        },
        // { 
        //   icon: HelpCircle, 
        //   label: 'Help & Support', 
        //   href: '/instructor/support',
        //   description: 'Get help',
        //   badge: null
        // },
      ]
    }
  ];

  // Function to check if a menu item is active
  const isActive = (href: string) => {
    if (href === '/instructor/dashboard') {
      return pathname === '/instructor/dashboard';
    }
    // Special handling for settings
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
    return user?.email?.split('@')[0] || 'Teacher';
  };

  return (
    <Sidebar 
      variant="inset" 
      collapsible="icon"
      className="relative border-r border-gray-800 w-full sm:w-80 bg-black border-b sm:border-b-0 transition-all duration-300 ease-in-out"
    >

      <SidebarHeader className="bg-gray-900 border-b border-gray-700 rounded-b-2xl transition-all duration-300">
        <div className="flex items-center gap-3 px-4 py-4">
          {user?.image ? (
            <img
              src={user.image}
              alt={getUserDisplayName()}
              className="size-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-purple-600 text-white text-sm font-bold flex-shrink-0">
              {user ? getUserInitials(getUserDisplayName()) : 'T'}
            </div>
          )}
          <div className="grid flex-1 text-left min-w-0">
            <span className="truncate font-bold text-lg text-white">
              {user ? getUserDisplayName() : 'Teacher'}
            </span>
            <span className="truncate text-sm text-gray-300 hidden sm:block">
              Teacher
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-black">
        {menuItems.map((category, categoryIndex) => (
          <SidebarGroup key={categoryIndex} className="mb-4 last:mb-0">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4 hidden sm:block">
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
                        className={`
                          group relative transition-all duration-200 rounded-lg cursor-pointer py-3 px-3
                          ${active 
                            ? 'bg-purple-900/30 text-purple-300 border-l-4 border-purple-400' 
                            : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`
                            flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0
                            ${active ? 'text-purple-300' : 'text-gray-400 group-hover:text-gray-300'}
                          `}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <span className={`font-medium text-sm truncate ${active ? 'text-purple-200' : ''}`}>{item.label}</span>
                            {item.badge && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-purple-600 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Active state glow effect */}
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg" />
                        )}
                        
                        {/* Active state indicator dot */}
                        {active && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full" />
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
      
      <SidebarFooter className="bg-gray-900 border-t border-gray-700 rounded-t-2xl transition-all duration-300">
        <div className="p-4">
          {/* Action Buttons */}
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Settings"
                onClick={() => router.push('/instructor/settings')}
                className={`group relative transition-all duration-200 rounded-lg ${
                  pathname.startsWith('/instructor/settings')
                    ? 'bg-purple-900/30 text-purple-300 border-l-4 border-purple-400'
                    : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-5 h-5 transition-colors duration-200 flex-shrink-0 ${
                    pathname.startsWith('/instructor/settings')
                      ? 'text-purple-300'
                      : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className={`font-medium text-sm ${
                    pathname.startsWith('/instructor/settings')
                      ? 'text-purple-200'
                      : ''
                  }`}>Settings</span>
                </div>
                
                {/* Active state glow effect */}
                {pathname.startsWith('/instructor/settings') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg" />
                )}
                
                {/* Active state indicator dot */}
                {pathname.startsWith('/instructor/settings') && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full" />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Logout" 
                onClick={handleLogout}
                disabled={isLoading}
                className="group relative transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 transition-colors duration-200 text-red-400 group-hover:text-red-300 flex-shrink-0">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-red-400 border-t-red-200 rounded-full animate-spin"></div>
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

export default TeacherSidebar;
