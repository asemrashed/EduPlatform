export interface BlogPost {
  id: number;
  image: string;
  date: string;
  author: string;
  authorBengali: string;
  comments: string;
  commentsBengali: string;
  title: string;
  titleBengali: string;
  description: string;
  descriptionBengali: string;
}

export interface BlogContent {
  label: {
    text: string;
    backgroundColor: string;
  };
  title: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
  };
  titleColors: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
  };
  gradientColors?: {
    from: string;
    via?: string;
    to: string;
  };
  buttonText: string;
  posts: BlogPost[];
}

export const defaultBlogContent: BlogContent = {
  label: {
    text: "আমাদের ব্লগ",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আমাদের সর্বশেষ",
    part2: "খবর",
    part3: "এবং",
    part4: "ব্লগ",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#1E3A8A",
    part3: "#1E3A8A",
    part4: "gradient", // Can be gradient or color
  },
  gradientColors: {
    from: "#EC4899",
    via: "#14B8A6",
    to: "#10B981",
  },
  buttonText: "আরও পড়ুন",
  posts: [
    {
      id: 1,
      image: "https://live.themewild.com/edubo/assets/img/blog/01.jpg",
      date: "Aug 20, 2025",
      author: "Alicia Davis",
      authorBengali: "অ্যালিসিয়া ডেভিস",
      comments: "2.5k",
      commentsBengali: "2.5k মন্তব্য",
      title: "There Are Many Variations Of Passages Orem Available.",
      titleBengali: "অনেক ধরনের প্যাসেজ ওরেম পাওয়া যায়।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 2,
      image: "https://live.themewild.com/edubo/assets/img/blog/02.jpg",
      date: "Aug 23, 2025",
      author: "Michael Chen",
      authorBengali: "মাইকেল চেন",
      comments: "1.8k",
      commentsBengali: "1.8k মন্তব্য",
      title: "Generator Internet Repeat Tend Word Chunk Necessary.",
      titleBengali: "জেনারেটর ইন্টারনেট পুনরাবৃত্তি টেন্ড ওয়ার্ড চাঙ্ক প্রয়োজনীয়।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 3,
      image: "https://live.themewild.com/edubo/assets/img/blog/03.jpg",
      date: "Aug 25, 2025",
      author: "Sarah Johnson",
      authorBengali: "সারা জনসন",
      comments: "3.2k",
      commentsBengali: "3.2k মন্তব্য",
      title: "Survived Only Five Centuries But Also The Leap Into.",
      titleBengali: "শুধুমাত্র পাঁচ শতাব্দী বেঁচে আছে কিন্তু লিপেও।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
    {
      id: 4,
      image: "https://live.themewild.com/edubo/assets/img/blog/01.jpg",
      date: "Aug 28, 2025",
      author: "David Wilson",
      authorBengali: "ডেভিড উইলসন",
      comments: "1.9k",
      commentsBengali: "1.9k মন্তব্য",
      title: "Making This The First True Generator On The Internet.",
      titleBengali: "ইন্টারনেটে প্রথম সত্যিকারের জেনারেটর তৈরি করা।",
      description:
        "It is a long established fact that a reader will majority have suffered distracted readable.",
      descriptionBengali:
        "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক সংখ্যাগরিষ্ঠতা ভোগ করবে বিভ্রান্ত পাঠযোগ্য।",
    },
  ],
};

