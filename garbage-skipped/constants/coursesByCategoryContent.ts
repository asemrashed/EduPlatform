export interface CoursesByCategoryContent {
  label: {
    text: string;
    backgroundColor: string;
  };
  title: {
    part1: string;
    part2: string;
    part3: string;
  };
  titleColors: {
    part1: string;
    part2: string;
    part3: string;
  };
  gradientColors: {
    from: string;
    to: string;
  };
  buttonText: string;
  buttonHref: string;
  buttonGradientFrom: string;
  buttonGradientTo: string;
}

export const defaultCoursesByCategoryContent: CoursesByCategoryContent = {
  label: {
    text: "কোর্স",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "কোর্স",
    part2: "বাই",
    part3: "ক্যাটাগরি",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#1E3A8A",
    part3: "#A855F7", // This will use gradient
  },
  gradientColors: {
    from: "#A855F7",
    to: "#10B981",
  },
  buttonText: "সব কোর্স দেখুন",
  buttonHref: "/all-courses",
  buttonGradientFrom: "#EC4899",
  buttonGradientTo: "#A855F7",
};

