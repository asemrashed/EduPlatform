export interface AboutContent {
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
  features: Array<{
    title: string;
    description: string;
  }>;
  button: {
    text: string;
    href?: string;
  };
  experience: {
    number: string;
    label: string;
    gradientFrom: string;
    gradientTo: string;
  };
  images: {
    main: string;
    secondary: string;
  };
}

export const defaultAboutContent: AboutContent = {
  label: {
    text: "আমাদের সম্পর্কে",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "আপনি",
    part2: "শিখতে",
    part3: "চান বা",
    part4: "শেয়ার",
    part5: "করতে চান যা আপনি জানেন",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#10B981",
    part3: "#1E3A8A",
    part4: "#A855F7",
    part5: "#1E3A8A",
  },
  description: "Lorem Ipsum-এর অনেক বৈচিত্র্য পাওয়া যায়, কিন্তু বেশিরভাগই কোনো না কোনোভাবে পরিবর্তিত হয়েছে, হাস্যরসের কারণে, বা এলোমেলো শব্দ যা একেবারেই দেখতে ভালো লাগে না।",
  features: [
    {
      title: "নমনীয় শেখা",
      description: "আমাদের রাউন্ড শো-এর একটি দেখুন",
    },
    {
      title: "২৪/৭ লাইভ সহায়তা",
      description: "আমাদের রাউন্ড শো-এর একটি দেখুন",
    },
  ],
  button: {
    text: "আরও জানুন",
    href: "/#about",
  },
  experience: {
    number: "৩০+",
    label: "বছরের অভিজ্ঞতা",
    gradientFrom: "#FF6B35",
    gradientTo: "#EC4899",
  },
  images: {
    main: "https://live.themewild.com/edubo/assets/img/about/01.jpg",
    secondary: "https://live.themewild.com/edubo/assets/img/about/02.jpg",
  },
};

