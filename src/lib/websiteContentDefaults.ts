import type {
  AboutContent,
  BlogContent,
  CertificatesContent,
  ContactPageContent,
  CourseLessonBannerContent,
  CoursesByCategoryContent,
  CoursesContent,
  DownloadAppContent,
  FAQContent,
  FooterContent,
  HeroContent,
  PartnersContent,
  PhotoGalleryContent,
  PromoBannerContent,
  SectionConfig,
  ServicesContent,
  StatisticsContent,
  WhyChooseUsContent,
} from "@/lib/websiteContentTypes";

export type {
  AboutContent,
  BatchLevelItem,
  BlogContent,
  BlogPost,
  CertificateItem,
  CertificatesContent,
  CourseLessonBannerContent,
  CoursesByCategoryContent,
  CoursesContent,
  DownloadAppContent,
  FAQContent,
  FAQItem,
  FooterContent,
  FooterLink,
  GalleryImage,
  HeroContent,
  PhotoGalleryContent,
  PromoBannerContent,
  SectionConfig,
  SectionId,
  ServiceItem,
  ServicesContent,
  SocialMedia,
  StatisticsContent,
  StatisticsItem,
  WhyChooseUsContent,
  WhyChooseUsFeature,
} from "@/lib/websiteContentTypes";

const DEFAULT_SECTION_ORDER: SectionConfig[] = [
  { id: "header", label: "Header", enabled: true, order: 0 },
  { id: "hero", label: "Hero", enabled: true, order: 1 },
  { id: "about", label: "About", enabled: true, order: 2 },
  { id: "courses", label: "Courses", enabled: true, order: 3 },
  { id: "whyChooseUs", label: "Why Choose Us", enabled: true, order: 4 },
  { id: "statistics", label: "Statistics", enabled: true, order: 5 },
  { id: "services", label: "Services", enabled: true, order: 6 },
  { id: "certificates", label: "Certificates", enabled: true, order: 7 },
  { id: "coursesByCategory", label: "Courses By Category", enabled: true, order: 8 },
  { id: "testimonials", label: "Testimonials", enabled: true, order: 9 },
  { id: "photoGallery", label: "Photo Gallery", enabled: true, order: 10 },
  { id: "blog", label: "Blog", enabled: true, order: 11 },
  { id: "downloadApp", label: "Download App", enabled: true, order: 12 },
  { id: "footer", label: "Footer", enabled: true, order: 13 },
];
import {
  HOME_EXPERTS,
  HOME_FAQ,
  HOME_FEATURES,
  HOME_FEATURED_COURSES,
  HOME_FEATURES_IMAGE,
  HOME_HERO,
  HOME_PARTNERS,
  HOME_STATS,
  HOME_TESTIMONIALS,
} from "@/data/homePageContent";

/** Settings document category for CMS website content. */
export const WEBSITE_CONTENT_CATEGORY = "website-content";

export const CACHE_TAG_WEBSITE_CONTENT = "website-content";

const PRIMARY_COLOR = "#0040a1";
const SECONDARY_COLOR = "#b52330";

export interface WebsiteContent {
  metaTitle: string;
  marquee: {
    enabled: boolean;
    messages: string[];
    gradientFrom: string;
    gradientTo: string;
  };
  contact: {
    registrationNumber: string;
  };
  contactPage: ContactPageContent;
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  branding: {
    logoText: string;
    logoTextColor1: string;
    logoTextColor2: string;
    logoIconColor1: string;
    logoIconColor2: string;
    logoUrl: string;
    faviconUrl: string;
  };
  navigation: {
    home: {
      label: string;
      items: Array<{ label: string; href: string }>;
    };
    category: {
      label: string;
      items: Array<{ label: string; href: string }>;
    };
    pages: {
      label: string;
      items: Array<{ label: string; href: string }>;
    };
    courses: {
      label: string;
      items: Array<{ label: string; href: string }>;
    };
    account: {
      label: string;
      items: Array<{ label: string; href: string }>;
    };
    contact: {
      label: string;
      href: string;
    };
  };
  buttons: {
    liveCourse: {
      enabled: boolean;
      text: string;
    };
    login: {
      text: string;
      href: string;
    };
  };
  mobileMenu: {
    items: Array<{ label: string; href: string }>;
  };
  partners: PartnersContent;
  hero: HeroContent;
  about: AboutContent;
  whyChooseUs: WhyChooseUsContent;
  statistics: StatisticsContent;
  services: ServicesContent;
  certificates: CertificatesContent;
  photoGallery: PhotoGalleryContent;
  blog: BlogContent;
  downloadApp: DownloadAppContent;
  footer: FooterContent;
  courses: CoursesContent;
  coursesByCategory: CoursesByCategoryContent;
  sectionOrder: SectionConfig[];
  faq: FAQContent;
  promotionalBanner: PromoBannerContent;
  courseLessonBanner: CourseLessonBannerContent;
}

const ABOUT_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA49z5j8dNSWa9xyciQauqnApJ20f5WiqAAFt1WC0qJnfhMUz2PJC4u1-22QUWy7ne00W-7hNpWway3iinbaoTxzGVBdugweY_nGDoBhF9xnkL1QPXKw4AlJGLV35u6rQx1eW8GM9DaUFs5Zbl81chOkgg2lD0Fbct348O1Tyr3jCw1xpW7NDWRVmnI2cxsDNVGAeYALh7qYZ3FGBDKOoso9_EjggIWuvXSzy2uRtrm3XaWNlqGjaMQvFd3YkTCU4iLY_xewch068Y";

const categoryNavItems = Array.from(
  new Set(HOME_FEATURED_COURSES.map((c) => c.badge)),
).map((label) => ({ label, href: "/courses" }));

const whyChooseUsFeatureIcons: WhyChooseUsContent["features"][number]["iconType"][] = [
  "flexible",
  "instructor",
  "community",
  "money",
];

const serviceIconTypes: ServicesContent["services"][number]["iconType"][] = [
  "online-courses",
  "live-classes",
  "certification",
  "expert-support",
  "career-guidance",
  "lifetime-access",
];

/** Full default CMS payload (admin + public read) — EduPlatform English content. */
export const defaultWebsiteContent: WebsiteContent = {
  metaTitle: "EduPlatform — Online Learning Platform",
  marquee: {
    enabled: true,
    messages: [
      HOME_HERO.description,
      `${HOME_STATS[0].value} ${HOME_STATS[0].label} · ${HOME_STATS[1].value} ${HOME_STATS[1].label}`,
      `${HOME_STATS[2].value} ${HOME_STATS[2].label} · ${HOME_STATS[3].value} ${HOME_STATS[3].label}`,
    ],
    gradientFrom: PRIMARY_COLOR,
    gradientTo: SECONDARY_COLOR,
  },
  contact: {
    registrationNumber: "123, Road 1, Block A, Mirpur 10, Dhaka 1216",
  },
  contactPage: {
    headline: "Get in Touch",
    subheadline:
      "Have questions about our courses or need help choosing the right path? We're here to help.",
    mapEmbedUrl: "",
    phone: "+880 1717 1717 1717",
    email: "contact@carmarket.premium",
    address: "123, Road 1, Block A, Mirpur 10, Dhaka 1216",
  },
  socialMedia: {
    facebook: "#",
    twitter: "#",
    linkedin: "#",
  },
  branding: {
    logoText: "EduPlatform",
    logoTextColor1: PRIMARY_COLOR,
    logoTextColor2: SECONDARY_COLOR,
    logoIconColor1: SECONDARY_COLOR,
    logoIconColor2: PRIMARY_COLOR,
    logoUrl: "",
    faviconUrl: "",
  },
  navigation: {
    home: {
      label: "Home",
      items: [{ label: "Home", href: "/" }],
    },
    category: {
      label: "Categories",
      items: categoryNavItems,
    },
    pages: {
      label: "Pages",
      items: [
        { label: "About us", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    courses: {
      label: "Courses",
      items: [
        { label: "All Courses", href: "/courses" },
        { label: "Courses Designed for Success", href: "/#courses" },
      ],
    },
    account: {
      label: "Account",
      items: [
        { label: "Sign in", href: "/login" },
        { label: "Join for free", href: "/register" },
        { label: "Dashboard", href: "/student/dashboard" },
      ],
    },
    contact: {
      label: "Contact",
      href: "/contact",
    },
  },
  buttons: {
    liveCourse: {
      enabled: true,
      text: "All Courses",
    },
    login: {
      text: "Sign in",
      href: "/login",
    },
  },
  mobileMenu: {
    items: [
      { label: "Home", href: "/" },
      { label: "All Courses", href: "/courses" },
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  partners: {
    title: "Our Trusted Partners & Integrations",
    items: HOME_PARTNERS.map((name) => ({
      name,
      imageUrl: "",
      href: "",
    })),
  },
  hero: {
    subtitle: HOME_HERO.eyebrow,
    title: {
      part1: "Shape Your Future with the ",
      part2: "Right Knowledge",
      part3: "",
      part4: "",
      part5: "",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
      part3: PRIMARY_COLOR,
      part4: PRIMARY_COLOR,
      part5: PRIMARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    description: HOME_HERO.description,
    buttons: {
      primary: {
        text: "Join Now",
        href: "/register",
      },
      secondary: {
        text: "Join for free",
        href: "/register",
      },
    },
    carousel: {
      enabled: true,
      autoPlay: true,
      autoPlayInterval: 3000,
      items: HOME_FEATURED_COURSES.slice(0, 4).map((course, index) => ({
        id: index + 1,
        image: course.image,
        title: course.title,
        category: course.badge,
      })),
    },
    stats: {
      students: {
        enabled: true,
        count: "20,000+",
        avatars: HOME_EXPERTS.slice(0, 5).map((e) => e.image),
      },
      courses: {
        enabled: true,
        count: `${HOME_STATS[2].value} ${HOME_STATS[2].label}`,
      },
    },
  },
  about: {
    label: {
      text: "Who we are",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "The digital elite",
      part2: "knowledge",
      part3: "platform",
      part4: "",
      part5: "",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
      part3: PRIMARY_COLOR,
      part4: PRIMARY_COLOR,
      part5: PRIMARY_COLOR,
    },
    description:
      "We are a team of dedicated educators and professionals who are passionate about helping students achieve their academic goals.",
    features: [
      {
        title: "Curation",
        description:
          "Courses are reviewed for clarity, outcomes, and instructional quality.",
      },
      {
        title: "Community",
        description:
          "Learners and instructors share feedback to keep content current.",
      },
      {
        title: "Integrity",
        description: "Clear policies and support — no hidden fees in mock checkout flows.",
      },
    ],
    button: {
      text: "Explore courses",
      href: "/courses",
    },
    experience: {
      number: HOME_STATS[1].value,
      label: HOME_STATS[1].label,
      gradientFrom: PRIMARY_COLOR,
      gradientTo: SECONDARY_COLOR,
    },
    images: {
      main: ABOUT_HERO_IMAGE,
      secondary: ABOUT_HERO_IMAGE,
    },
  },
  whyChooseUs: {
    label: {
      text: "Features",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Powerful Features for an",
      part2: "Elite",
      part3: "Experience",
      part4: "",
      part5: "",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
      part3: PRIMARY_COLOR,
      part4: PRIMARY_COLOR,
      part5: PRIMARY_COLOR,
    },
    description:
      "Our platform isn't just about video lessons; it's a complete ecosystem designed to facilitate mastery and networking.",
    image: HOME_FEATURES_IMAGE,
    features: HOME_FEATURES.map((feature, index) => ({
      id: index + 1,
      title: feature.title,
      titleBn: feature.title,
      description: feature.body,
      descriptionBn: feature.body,
      iconType: whyChooseUsFeatureIcons[index] ?? "flexible",
    })),
  },
  statistics: {
    items: HOME_STATS.map((stat, index) => {
      const iconTypes: StatisticsContent["items"][number]["iconType"][] = [
        "awards",
        "tutors",
        "courses",
        "students",
      ];
      const match = stat.value.match(/^(\d+)(.*)$/);
      return {
        id: index + 1,
        number: match?.[1] ?? stat.value,
        suffix: match?.[2] ?? "",
        label: stat.label,
        labelBengali: stat.label,
        iconType: iconTypes[index] ?? "students",
      };
    }),
  },
  services: {
    label: {
      text: "Platform",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Powerful Features for an",
      part2: "Elite Experience",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    batchSection: {
      onlineButtonLabel: "Online learning",
      offlineButtonLabel: "In-person support",
      defaultActiveTab: "online",
      onlineBackground: {
        from: PRIMARY_COLOR,
        via: "#0056d2",
        to: PRIMARY_COLOR,
      },
      offlineBackground: {
        from: "#1E293B",
        via: "#334155",
        to: "#1E293B",
      },
      onlineLevels: categoryNavItems.slice(0, 8).map((item, index) => ({
        id: String(index + 1),
        label: item.label,
        subtitle: item.label,
        color: index % 2 === 0 ? PRIMARY_COLOR : SECONDARY_COLOR,
      })),
      offlineLevels: categoryNavItems.slice(0, 8).map((item, index) => ({
        id: String(index + 1),
        label: item.label,
        subtitle: `${item.label} (campus)`,
        color: index % 2 === 0 ? SECONDARY_COLOR : PRIMARY_COLOR,
      })),
    },
    services: [
      ...HOME_FEATURES.map((feature, index) => ({
        id: index + 1,
        title: feature.title,
        titleBengali: feature.title,
        description: feature.body,
        iconType: serviceIconTypes[index] ?? "online-courses",
      })),
      {
        id: 5,
        title: "Curation",
        titleBengali: "Curation",
        description:
          "Courses are reviewed for clarity, outcomes, and instructional quality.",
        iconType: "career-guidance" as const,
      },
      {
        id: 6,
        title: "Integrity",
        titleBengali: "Integrity",
        description: "Clear policies and support — no hidden fees in mock checkout flows.",
        iconType: "lifetime-access" as const,
      },
    ],
  },
  certificates: {
    label: {
      text: "Certificates",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Course",
      part2: "Completion",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    certificates: [
      {
        id: 1,
        titleBengali: HOME_FAQ[2].q,
        titleEnglish: HOME_FAQ[2].q,
        imageUrl: HOME_HERO.heroImage,
        description: HOME_FAQ[2].a,
      },
    ],
    about: {
      title: "EduPlatform",
      description: [
        "Welcome to Edu Platform, a premier education hub dedicated to transforming academic dreams into reality. We bridge the gap between aspiring students and top-tier global universities through expert guidance, personalized counseling, and comprehensive test preparation.",
        HOME_HERO.description,
      ],
      imageUrl: ABOUT_HERO_IMAGE,
      name: "EduPlatform",
      affiliation: "The digital elite knowledge platform",
    },
  },
  photoGallery: {
    label: {
      text: "Experts",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Meet Our Expert",
      part2: "Mentors",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    images: HOME_EXPERTS.map((expert, index) => ({
      id: index + 1,
      image: expert.image,
      alt: `${expert.name} — ${expert.role}`,
    })),
  },
  blog: {
    label: {
      text: "Testimonials",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "What Our Learners",
      part2: "Are",
      part3: "Saying",
      part4: "",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: PRIMARY_COLOR,
      part3: SECONDARY_COLOR,
      part4: PRIMARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    buttonText: "View all courses",
    posts: HOME_TESTIMONIALS.map((item, index) => ({
      id: index + 1,
      image: item.avatar,
      date: "",
      author: item.name,
      authorBengali: item.name,
      comments: "",
      commentsBengali: "",
      title: item.quote,
      titleBengali: item.quote,
      description: item.role,
      descriptionBengali: item.role,
    })),
  },
  downloadApp: {
    label: {
      text: "Newsletter",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "EduPlatform",
      part2: "curated",
      part3: "knowledge",
      part4: "for",
      part5: "learners",
      part6: "worldwide",
      part7: "",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: PRIMARY_COLOR,
      part3: SECONDARY_COLOR,
      part4: PRIMARY_COLOR,
      part5: SECONDARY_COLOR,
      part6: PRIMARY_COLOR,
      part7: PRIMARY_COLOR,
    },
    description: "Stay updated with our curated knowledge.",
    buttons: {
      googlePlay: {
        text: "Explore courses",
        href: "/courses",
        gradientFrom: PRIMARY_COLOR,
        gradientTo: "#0056d2",
      },
      appStore: {
        text: "Contact us",
        href: "/contact",
        gradientFrom: SECONDARY_COLOR,
        gradientVia: "#c42e3a",
        gradientTo: SECONDARY_COLOR,
      },
    },
    backgroundImage: HOME_FEATURES_IMAGE,
  },
  footer: {
    branding: {
      logoText: "EduPlatform",
      logoIcon: "E",
      logoIconColor: PRIMARY_COLOR,
      logoTextColor: PRIMARY_COLOR,
      description:
        "Elevating digital education through premium curation and world-class expert networks.",
    },
    newsletter: {
      title: "Newsletter",
      emailPlaceholder: "Email",
      buttonText: "Subscribe",
      buttonGradientFrom: PRIMARY_COLOR,
      buttonGradientTo: SECONDARY_COLOR,
    },
    companyLinks: [
      { label: "About us", href: "/about" },
      { label: "Courses", href: "/courses" },
      { label: "Expert network", href: "/courses" },
    ],
    quickLinks: [
      { label: "Home", href: "/" },
      { label: "All Courses", href: "/courses" },
      { label: "Contact", href: "/contact" },
    ],
    contact: {
      address: {
        label: "Headquarters",
        value: "123, Road 1, Block A, Mirpur 10, Dhaka 1216",
      },
      phone: {
        label: "Phone",
        value: "+880 1717 1717 1717",
      },
      email: {
        label: "Email",
        value: "contact@carmarket.premium",
      },
    },
    copyright: "© EduPlatform. The digital curator of elite knowledge.",
    backgroundGradient: {
      from: "#E8EEF7",
      to: "#F5E8EA",
    },
  },
  courses: {
    label: {
      text: "Courses",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Courses Designed for",
      part2: "Success",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    buttonText: "View all",
    buttonHref: "/courses",
    buttonGradientFrom: PRIMARY_COLOR,
    buttonGradientTo: SECONDARY_COLOR,
    featuredCourseIds: undefined,
  },
  coursesByCategory: {
    label: {
      text: "Categories",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Browse courses",
      part2: "by",
      part3: "category",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: PRIMARY_COLOR,
      part3: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    buttonText: "View all",
    buttonHref: "/courses",
    buttonGradientFrom: PRIMARY_COLOR,
    buttonGradientTo: SECONDARY_COLOR,
  },
  sectionOrder: DEFAULT_SECTION_ORDER,
  faq: {
    label: {
      text: "FAQ",
      backgroundColor: PRIMARY_COLOR,
    },
    title: {
      part1: "Frequently Asked",
      part2: "Questions",
    },
    titleColors: {
      part1: PRIMARY_COLOR,
      part2: SECONDARY_COLOR,
    },
    gradientColors: {
      from: PRIMARY_COLOR,
      to: SECONDARY_COLOR,
    },
    faqs: HOME_FAQ.map((item, index) => ({
      id: index + 1,
      question: item.q,
      answer: item.a,
      order: index + 1,
    })),
  },
  promotionalBanner: {
    enabled: true,
    imageUrl: "",
    link: "/courses",
    headline: "Courses Designed for Success",
    subtext:
      "Curated paths focusing on high-impact skills that the global market demands today..",
    ctaLabel: "View all",
  },
  courseLessonBanner: {
    enabled: true,
    title: HOME_FEATURES[2].title,
    imageUrl: "",
  },
};

export function validateWebsiteContent(settings: unknown): { isValid: boolean; error?: string } {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return { isValid: false, error: "Settings must be an object" };
  }

  const s = settings as Record<string, unknown>;

  if (s.marquee && typeof s.marquee === "object") {
    const marquee = s.marquee as Record<string, unknown>;
    if (marquee.enabled !== undefined && typeof marquee.enabled !== "boolean") {
      return { isValid: false, error: "Marquee enabled must be a boolean" };
    }
    if (marquee.messages !== undefined && !Array.isArray(marquee.messages)) {
      return { isValid: false, error: "Marquee messages must be an array" };
    }
  }

  if (s.metaTitle !== undefined && typeof s.metaTitle !== "string") {
    return { isValid: false, error: "Meta title must be a string" };
  }

  if (s.courseLessonBanner && typeof s.courseLessonBanner === "object") {
    const banner = s.courseLessonBanner as Record<string, unknown>;
    if (banner.enabled !== undefined && typeof banner.enabled !== "boolean") {
      return { isValid: false, error: "Course lesson banner enabled must be a boolean" };
    }
  }

  return { isValid: true };
}

/** Per-section defaults (slices of `defaultWebsiteContent`) for admin/legacy CMS UIs. */
export const defaultHeroContent = defaultWebsiteContent.hero;
export const defaultAboutContent = defaultWebsiteContent.about;
export const defaultWhyChooseUsContent = defaultWebsiteContent.whyChooseUs;
export const defaultStatisticsContent = defaultWebsiteContent.statistics;
export const defaultServicesContent = defaultWebsiteContent.services;
export const defaultCertificatesContent = defaultWebsiteContent.certificates;
export const defaultPhotoGalleryContent = defaultWebsiteContent.photoGallery;
export const defaultBlogContent = defaultWebsiteContent.blog;
export const defaultDownloadAppContent = defaultWebsiteContent.downloadApp;
export const defaultFooterContent = defaultWebsiteContent.footer;
export const defaultPartnersContent = defaultWebsiteContent.partners;
export const defaultCoursesContent = defaultWebsiteContent.courses;
export const defaultCoursesByCategoryContent = defaultWebsiteContent.coursesByCategory;
export const defaultSectionOrder = defaultWebsiteContent.sectionOrder;
export const defaultFAQContent = defaultWebsiteContent.faq;
export const defaultPromoBannerContent = defaultWebsiteContent.promotionalBanner;
export const defaultCourseLessonBannerContent = defaultWebsiteContent.courseLessonBanner;
export const defaultContactPageContent = defaultWebsiteContent.contactPage;
