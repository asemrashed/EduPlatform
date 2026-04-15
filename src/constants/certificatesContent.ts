export interface CertificateItem {
  id: number;
  titleBengali: string;
  titleEnglish: string;
  imageUrl: string;
  description?: string;
}

export interface CertificatesContent {
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
    via?: string;
    to: string;
  };
  certificates: CertificateItem[];
  about: {
    title: string;
    description: string[];
    imageUrl: string;
    name: string;
    affiliation: string;
  };
}

export const defaultCertificatesContent: CertificatesContent = {
  label: {
    text: "সার্টিফিকেট",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "সার্টিফিকেট",
    part2: "নমুনা",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "gradient", // Can be gradient or color
  },
  gradientColors: {
    from: "#10B981",
    via: "#14B8A6",
    to: "#A855F7",
  },
  certificates: [
    {
      id: 1,
      titleBengali: "CodeZyne কোর্স সম্পন্ন সার্টিফিকেটের নমুনা",
      titleEnglish: "Sample of CodeZyne Course Completion Certificate",
      imageUrl: "https://res.cloudinary.com/dbb4gapse/image/upload/v1765968229/Screenshot_from_2025-12-17_16-43-31_rzhye6.png",
      description: "এই সার্টিফিকেটটি CodeZyne প্ল্যাটফর্মে কোর্স সম্পন্নকারী শিক্ষার্থীদের প্রদান করা হয়। এটি শিক্ষার্থীদের দক্ষতা এবং জ্ঞানের স্বীকৃতি প্রদান করে।",
    },
    {
      id: 2,
      titleBengali: "CodeZyne পেশাদার সার্টিফিকেটের নমুনা",
      titleEnglish: "Sample of CodeZyne Professional Certificate",
      imageUrl: "https://res.cloudinary.com/dbb4gapse/image/upload/v1765968355/Screenshot_from_2025-12-17_16-42-14_ie19wy.png",
      description: "",
    },
  ],
  about: {
    title: "CodeZyne সম্পর্কে",
    description: [
      "CodeZyne একটি আধুনিক শিক্ষা প্রযুক্তি প্ল্যাটফর্ম যা শিক্ষার্থী, শিক্ষক এবং শিক্ষা প্রতিষ্ঠানগুলোর জন্য সম্পূর্ণ ডিজিটাল শিক্ষা ব্যবস্থা প্রদান করে। আমাদের প্ল্যাটফর্মের মাধ্যমে শিক্ষার্থীরা যেকোনো সময়, যেকোনো স্থান থেকে মানসম্মত শিক্ষা গ্রহণ করতে পারে এবং শিক্ষকরা সহজেই কোর্স তৈরি, পরীক্ষা পরিচালনা এবং শিক্ষার্থীদের অগ্রগতি পর্যবেক্ষণ করতে পারেন।",
      "CodeZyne বিভিন্ন ধরনের কোর্স অফার করে যার মধ্যে রয়েছে প্রযুক্তি, ব্যবসা, শিল্পকলা, বিজ্ঞান এবং আরও অনেক বিষয়। আমাদের প্ল্যাটফর্মে ইন্টারেক্টিভ ভিডিও লেকচার, লাইভ ক্লাস, অ্যাসাইনমেন্ট, কুইজ এবং সার্টিফিকেট প্রদানের সুবিধা রয়েছে। এছাড়াও CodeZyne Android এবং iOS মোবাইল অ্যাপের মাধ্যমে শিক্ষার্থীরা তাদের শিক্ষা কার্যক্রম চালিয়ে যেতে পারে।",
      "CodeZyne-এর লক্ষ্য হলো বাংলাদেশের শিক্ষা ব্যবস্থাকে ডিজিটালাইজেশন করে সকলের জন্য শিক্ষাকে সহজলভ্য করা। আমরা বিশ্বাস করি যে প্রযুক্তির মাধ্যমে শিক্ষা সকলের কাছে পৌঁছে দেওয়া সম্ভব এবং আমাদের প্ল্যাটফর্ম এই লক্ষ্য অর্জনে গুরুত্বপূর্ণ ভূমিকা পালন করছে। CodeZyne-এর মাধ্যমে হাজার হাজার শিক্ষার্থী তাদের শিক্ষা কার্যক্রম সফলভাবে সম্পন্ন করেছে এবং তাদের ক্যারিয়ার গড়ে তুলেছে।",
    ],
    imageUrl: "https://res.cloudinary.com/dbb4gapse/image/upload/v1765968300/image_hk23e1.webp",
    name: "CodeZyne Team",
    affiliation: "আধুনিক শিক্ষা প্রযুক্তি প্ল্যাটফর্ম",
  },
};
