import type { IconType } from "react-icons";
import {
  LuBookOpen as BookOpen,
  LuBookmark,
  LuChartBar,
  LuClipboardList,
  LuClock,
  LuDatabase,
  LuFileCheck,
  LuFileText,
  LuGlobe as Globe,
  LuGraduationCap as GraduationCap,
  LuLayoutDashboard,
  LuMessageSquare as MessageSquare,
  LuSettings as Settings,
  LuStar as Star,
  LuTag as Tag,
  LuUserCheck as UserCheck,
  LuUsers as Users,
} from "react-icons/lu";
import type { DashboardRole } from "@/types/dashboard";

export type SidebarNavItem = {
  icon: IconType;
  label: string;
  href: string;
  badge?: string | null;
};

export type SidebarNavCategory = {
  category: string;
  items: SidebarNavItem[];
};

/** Mirrors `learning-project/src/components/StudentSidebar.tsx` — paths match App Router. */
const studentNav: SidebarNavCategory[] = [
  {
    category: "Main",
    items: [
      {
        icon: LuLayoutDashboard,
        label: "Dashboard",
        href: "/student/dashboard",
        badge: null,
      },
    ],
  },
  {
    category: "Learning",
    items: [
      { icon: BookOpen, label: "My Courses", href: "/student/courses", badge: null },
      { icon: GraduationCap, label: "Exams", href: "/student/exams", badge: null },
      { icon: LuFileText, label: "Assignments", href: "/student/assignments", badge: "2" },
      { icon: LuBookmark, label: "Pass Papers", href: "/student/pass-papers", badge: null },
      { icon: Star, label: "Reviews", href: "/student/reviews", badge: null },
    ],
  },
  {
    category: "Performance",
    items: [
      { icon: LuChartBar, label: "Progress", href: "/student/progress", badge: null },
      { icon: LuClock, label: "Exam History", href: "/student/exam-history", badge: null },
    ],
  },
  {
    category: "Account",
    items: [
      { icon: Users, label: "Profile", href: "/student/profile", badge: null },
      { icon: Settings, label: "Settings", href: "/student/settings", badge: null },
    ],
  },
];

/** Mirrors `learning-project/src/components/TeacherSidebar.tsx`. */
const instructorNav: SidebarNavCategory[] = [
  {
    category: "Main",
    items: [
      {
        icon: LuLayoutDashboard,
        label: "Dashboard",
        href: "/instructor/dashboard",
        badge: null,
      },
    ],
  },
  {
    category: "Teaching",
    items: [
      { icon: BookOpen, label: "My Courses", href: "/instructor/courses", badge: null },
      { icon: Users, label: "Students", href: "/instructor/students", badge: null },
      { icon: LuClipboardList, label: "Assignments", href: "/instructor/assignments", badge: "3" },
      { icon: LuBookmark, label: "Pass Papers", href: "/instructor/pass-papers", badge: null },
      { icon: LuFileText, label: "Question Bank", href: "/instructor/question-bank", badge: null },
      { icon: LuFileText, label: "Exams", href: "/instructor/exams", badge: null },
      { icon: Users, label: "Enrollments", href: "/instructor/enrollments", badge: null },
      { icon: Star, label: "Reviews", href: "/instructor/reviews", badge: null },
    ],
  },
  {
    category: "Account",
    items: [{ icon: GraduationCap, label: "Profile", href: "/instructor/profile", badge: null }],
  },
];

/** Mirrors `learning-project/src/components/AppSidebar.tsx` (active menu subset). */
const adminNav: SidebarNavCategory[] = [
  {
    category: "Main",
    items: [
      {
        icon: LuLayoutDashboard,
        label: "Dashboard",
        href: "/admin/dashboard",
        badge: null,
      },
    ],
  },
  {
    category: "Learning",
    items: [
      { icon: BookOpen, label: "Courses", href: "/admin/courses", badge: null },
      { icon: Tag, label: "Categories", href: "/admin/categories", badge: null },
      { icon: LuFileText, label: "Assignments", href: "/admin/assignments", badge: null },
      { icon: LuBookmark, label: "Pass Papers", href: "/admin/pass-papers", badge: null },
      { icon: LuFileCheck, label: "Exams", href: "/admin/exams", badge: null },
      { icon: LuDatabase, label: "Question Bank", href: "/admin/question-bank", badge: null },
    ],
  },
  {
    category: "People",
    items: [
      { icon: Users, label: "Students", href: "/admin/students", badge: null },
      { icon: GraduationCap, label: "Teachers", href: "/admin/teachers", badge: null },
      { icon: UserCheck, label: "Enrollments", href: "/admin/enrollments", badge: null },
    ],
  },
  {
    category: "Communication",
    items: [
      { icon: Star, label: "Reviews", href: "/admin/reviews", badge: null },
      { icon: MessageSquare, label: "Course FAQ", href: "/admin/faq", badge: null },
    ],
  },
  {
    category: "System",
    items: [{ icon: Globe, label: "Website Content", href: "/admin/website-content", badge: null }],
  },
];

export function getDashboardSidebarNav(
  role: DashboardRole,
): SidebarNavCategory[] {
  switch (role) {
    case "student":
      return studentNav;
    case "instructor":
      return instructorNav;
    case "admin":
      return adminNav;
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}

/** On QA `/dashboard`, keep "Dashboard" nav pointing at `/dashboard` (role switcher context). */
export function getDashboardSidebarNavForPath(
  role: DashboardRole,
  pathname: string,
): SidebarNavCategory[] {
  const base = getDashboardSidebarNav(role);
  if (pathname !== "/dashboard") return base;
  return base.map((cat) => ({
    ...cat,
    items: cat.items.map((it) =>
      it.label === "Dashboard" ? { ...it, href: "/dashboard" } : it,
    ),
  }));
}
