export interface WhyChooseUsFeature {
  id: number;
  title: string;
  titleBn: string; // Bengali title
  description: string;
  descriptionBn: string; // Bengali description
  iconType: 'money' | 'instructor' | 'flexible' | 'community';
}

export interface WhyChooseUsContent {
  label: {
    text: string;
    backgroundColor: string;
  };
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
  description: string;
  image: string;
  features: WhyChooseUsFeature[];
}

export const defaultWhyChooseUsContent: WhyChooseUsContent = {
  label: {
    text: "কেন আমাদের বেছে নেবেন",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আমরা",
    part2: "বিশেষজ্ঞতা",
    part3: "প্রদান করি যা আপনি",
    part4: "ভরসা",
    part5: "করতে পারেন আমাদের সেবা",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#14B8A6",
    part3: "#1E3A8A",
    part4: "#A855F7",
    part5: "#1E3A8A",
  },
  description: "এটি একটি দীর্ঘ প্রতিষ্ঠিত সত্য যে একজন পাঠক তার লেআউট দেখার সময় একটি পৃষ্ঠার পাঠযোগ্য বিষয়বস্তু দ্বারা বিভ্রান্ত হবে।",
  image: "https://live.themewild.com/edubo/assets/img/choose/01.jpg",
  features: [
    {
      id: 1,
      title: "Affordable Cost",
      titleBn: "সাশ্রয়ী মূল্য",
      description: "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBn: "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
      iconType: "money",
    },
    {
      id: 2,
      title: "Expert Instructors",
      titleBn: "বিশেষজ্ঞ প্রশিক্ষক",
      description: "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBn: "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
      iconType: "instructor",
    },
    {
      id: 3,
      title: "Flexible Learning",
      titleBn: "নমনীয় শেখা",
      description: "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBn: "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
      iconType: "flexible",
    },
    {
      id: 4,
      title: "Supportive Community",
      titleBn: "সহায়ক সম্প্রদায়",
      description: "There are many variations of have suffered alteration some layout by injected humour.",
      descriptionBn: "অনেক বৈচিত্র্য রয়েছে যা কিছু লেআউটে হাস্যরসের কারণে পরিবর্তন হয়েছে।",
      iconType: "community",
    },
  ],
};

