export interface HeroContent {
  subtitle: string;
  title: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
    part5: string;
  };
  titleColors: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
    part5: string;
  };
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
  description: string;
  buttons: {
    primary: {
      text: string;
      href: string;
    };
    secondary: {
      text: string;
      href: string;
    };
  };
  carousel: {
    enabled: boolean;
    autoPlay: boolean;
    autoPlayInterval: number;
    items: Array<{
      id: number;
      image: string;
      title: string;
      category: string;
    }>;
  };
  stats: {
    students: {
      enabled: boolean;
      count: string;
      avatars: string[];
    };
    courses: {
      enabled: boolean;
      count: string;
    };
  };
}

export const defaultHeroContent: HeroContent = {
  subtitle: "নতুন যাত্রা শুরু করুন",
  title: {
    part1: "সেরা শেখার",
    part2: "প্ল্যাটফর্ম",
    part3: "যা",
    part4: "আপনাকে পরবর্তী স্তরে",
    part5: "নিয়ে যাবে",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "gradient",
    part3: "#EC4899",
    part4: "#1E3A8A",
    part5: "#1E3A8A",
  },
  gradientColors: {
    from: "#10B981",
    via: "#14B8A6",
    to: "#EC4899",
  },
  description: "\"orem psum\" অনুচ্ছেদের অনেক বৈচিত্র্য পাওয়া যায়, কিন্তু বেশিরভাগ অনুচ্ছেদেই হাস্যরসের কারণে কোনো না কোনোভাবে পরিবর্তন এসেছে।",
  buttons: {
    primary: {
      text: "আরও সম্পর্কে",
      href: "/#about",
    },
    secondary: {
      text: "আরও জানুন",
      href: "/#courses",
    },
  },
  carousel: {
    enabled: true,
    autoPlay: true,
    autoPlayInterval: 3000,
    items: [
      {
        id: 1,
        image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
        title: "Complete JavaScript Course",
        category: "Development",
      },
      {
        id: 2,
        image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
        title: "UI/UX Design Masterclass",
        category: "Design",
      },
      {
        id: 3,
        image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
        title: "Digital Marketing Course",
        category: "Business",
      },
      {
        id: 4,
        image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
        title: "Python Programming",
        category: "Development",
      },
    ],
  },
  stats: {
    students: {
      enabled: true,
      count: "২৫০,০০০+ শিক্ষার্থী",
      avatars: [
        "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
        "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
        "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
        "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
        "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      ],
    },
    courses: {
      enabled: true,
      count: "১৬০+ কোর্স",
    },
  },
};

