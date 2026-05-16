export interface ServiceItem {
  id: number;
  title: string;
  titleBengali: string;
  description: string;
  iconType: 'online-courses' | 'live-classes' | 'certification' | 'expert-support' | 'career-guidance' | 'lifetime-access';
}

export interface BatchLevelItem {
  id: string;
  label: string;
  subtitle: string;
  color: string;
}

export interface BatchSectionContent {
  onlineButtonLabel: string;
  offlineButtonLabel: string;
  defaultActiveTab: 'online' | 'offline';
  onlineBackground: {
    from: string;
    via: string;
    to: string;
  };
  offlineBackground: {
    from: string;
    via: string;
    to: string;
  };
  onlineLevels: BatchLevelItem[];
  offlineLevels: BatchLevelItem[];
}

export interface ServicesContent {
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
  gradientColors?: {
    from: string;
    to: string;
  };
  services: ServiceItem[];
  batchSection?: BatchSectionContent;
}

export const defaultServicesContent: ServicesContent = {
  label: {
    text: "আমাদের সেবা",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আমাদের",
    part2: "সেবা",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "gradient", // Can be gradient or color
  },
  gradientColors: {
    from: "#A855F7",
    to: "#10B981",
  },
  batchSection: {
    onlineButtonLabel: "অনলাইন ব্যাচ",
    offlineButtonLabel: "অফলাইন ব্যাচ",
    defaultActiveTab: "online",
    onlineBackground: {
      from: "#063248",
      via: "#0B4B6A",
      to: "#063248",
    },
    offlineBackground: {
      from: "#1E293B",
      via: "#334155",
      to: "#1E293B",
    },
    onlineLevels: [
      { id: "4", label: "৪র্থ", subtitle: "৪র্থ শ্রেণি", color: "#2563EB" },
      { id: "5", label: "৫ম", subtitle: "৫ম শ্রেণি", color: "#9333EA" },
      { id: "6", label: "৬ষ্ঠ", subtitle: "৬ষ্ঠ শ্রেণি", color: "#DC2626" },
      { id: "7", label: "৭ম", subtitle: "৭ম শ্রেণি", color: "#D97706" },
      { id: "8", label: "৮ম", subtitle: "৮ম শ্রেণি", color: "#16A34A" },
      { id: "9", label: "৯ম", subtitle: "৯ম শ্রেণি", color: "#DB2777" },
      { id: "10", label: "১০ম", subtitle: "১০ম শ্রেণি", color: "#1D4ED8" },
      { id: "hsc", label: "HSC", subtitle: "এইচ এস সি", color: "#7C3AED" },
    ],
    offlineLevels: [
      { id: "4", label: "৪র্থ", subtitle: "৪র্থ (ক্যাম্পাস)", color: "#0EA5E9" },
      { id: "5", label: "৫ম", subtitle: "৫ম (ক্যাম্পাস)", color: "#14B8A6" },
      { id: "6", label: "৬ষ্ঠ", subtitle: "৬ষ্ঠ (ক্লাসরুম)", color: "#22C55E" },
      { id: "7", label: "৭ম", subtitle: "৭ম (ক্লাসরুম)", color: "#84CC16" },
      { id: "8", label: "৮ম", subtitle: "৮ম (একাডেমিক)", color: "#F59E0B" },
      { id: "9", label: "৯ম", subtitle: "৯ম (SSC প্রিপ)", color: "#F97316" },
      { id: "10", label: "১০ম", subtitle: "১০ম (SSC প্রিপ)", color: "#EF4444" },
      { id: "hsc", label: "HSC", subtitle: "HSC (স্পেশাল)", color: "#6366F1" },
    ],
  },
  services: [
    {
      id: 1,
      title: "Online Courses",
      titleBengali: "অনলাইন কোর্স",
      description: "আমাদের বিস্তৃত অনলাইন কোর্স লাইব্রেরি থেকে আপনার পছন্দের বিষয়ে শিখুন।",
      iconType: "online-courses",
    },
    {
      id: 2,
      title: "Live Classes",
      titleBengali: "লাইভ ক্লাস",
      description: "বিশেষজ্ঞ শিক্ষকদের সাথে ইন্টারেক্টিভ লাইভ ক্লাসে অংশগ্রহণ করুন।",
      iconType: "live-classes",
    },
    {
      id: 3,
      title: "Certification",
      titleBengali: "সার্টিফিকেশন",
      description: "কোর্স সম্পন্ন করার পর আন্তর্জাতিক মানের সার্টিফিকেট পান।",
      iconType: "certification",
    },
    {
      id: 4,
      title: "Expert Support",
      titleBengali: "বিশেষজ্ঞ সহায়তা",
      description: "২৪/৭ বিশেষজ্ঞ শিক্ষকদের কাছ থেকে সহায়তা এবং গাইডেন্স পান।",
      iconType: "expert-support",
    },
    {
      id: 5,
      title: "Career Guidance",
      titleBengali: "ক্যারিয়ার গাইডেন্স",
      description: "ক্যারিয়ার কাউন্সেলিং এবং জব প্লেসমেন্ট সহায়তা পান।",
      iconType: "career-guidance",
    },
    {
      id: 6,
      title: "Lifetime Access",
      titleBengali: "আজীবন অ্যাক্সেস",
      description: "কোর্স কেনার পর আজীবন অ্যাক্সেস পান এবং যেকোনো সময় রিভিশন করুন।",
      iconType: "lifetime-access",
    },
  ],
};
