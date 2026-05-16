export interface CoursesContent {
  label: {
    text: string;
    backgroundColor: string;
  };
  title: {
    part1: string;
    part2: string;
  };
  titleColors: {
    part1: string;
    part2: string;
  };
  gradientColors: {
    from: string;
    via?: string;
    to: string;
  };
  buttonText: string;
  buttonHref: string;
  buttonGradientFrom: string;
  buttonGradientTo: string;
  /** Course IDs to show in the homepage courses section, in order. If empty/undefined, latest 8 courses are shown. */
  featuredCourseIds?: string[];
}

export const defaultCoursesContent: CoursesContent = {
  label: {
    text: "আমাদের কোর্স",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আমাদের সবচেয়ে জনপ্রিয়",
    part2: "কোর্স",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#A855F7", // This will use gradient
  },
  gradientColors: {
    from: "#10B981",
    via: "#14B8A6",
    to: "#A855F7",
  },
  buttonText: "সব কোর্স দেখুন",
  buttonHref: "/all-courses",
  buttonGradientFrom: "#EC4899",
  buttonGradientTo: "#A855F7",
  featuredCourseIds: undefined,
};

