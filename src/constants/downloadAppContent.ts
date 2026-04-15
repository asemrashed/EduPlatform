export interface DownloadAppContent {
  label: {
    text: string;
    backgroundColor: string;
  };
  title: {
    part1: string; // CodeZyne
    part2: string; // Android
    part3: string; // এবং
    part4: string; // IOS
    part5: string; // অ্যাপ
    part6: string; // উপলব্ধ
    part7: string; // !
  };
  titleColors: {
    part1: string;
    part2: string;
    part3: string;
    part4: string;
    part5: string;
    part6: string;
    part7: string;
  };
  description: string;
  buttons: {
    googlePlay: {
      text: string;
      href: string;
      gradientFrom: string;
      gradientTo: string;
    };
    appStore: {
      text: string;
      href: string;
      gradientFrom: string;
      gradientVia?: string;
      gradientTo: string;
    };
  };
  backgroundImage: string;
}

export const defaultDownloadAppContent: DownloadAppContent = {
  label: {
    text: "আমাদের অ্যাপ ডাউনলোড করুন",
    backgroundColor: "#A855F7",
  },
  title: {
    part1: "CodeZyne",
    part2: "Android",
    part3: "এবং",
    part4: "IOS",
    part5: "অ্যাপ",
    part6: "উপলব্ধ",
    part7: "!",
  },
  titleColors: {
    part1: "#1E3A8A",
    part2: "#1E3A8A",
    part3: "#60A5FA",
    part4: "#A855F7",
    part5: "#A855F7",
    part6: "#A855F7",
    part7: "#1E3A8A",
  },
  description:
    "অনেক ধরনের প্যাসেজ পাওয়া যায় কিন্তু সংখ্যাগরিষ্ঠতা কিছু ফর্মে ভোগ করেছে যাচ্ছে ইনজেক্ট করা হাস্যরস দ্বারা একটি প্যাসেজ ব্যবহার করতে।",
  buttons: {
    googlePlay: {
      text: "Google Play এ পান",
      href: "#",
      gradientFrom: "#A855F7",
      gradientTo: "#9333EA",
    },
    appStore: {
      text: "App Store এ পান",
      href: "#",
      gradientFrom: "#FF6B35",
      gradientVia: "#FF8C42",
      gradientTo: "#FFB84D",
    },
  },
  backgroundImage: "https://live.themewild.com/edubo/assets/img/download/01.png",
};

