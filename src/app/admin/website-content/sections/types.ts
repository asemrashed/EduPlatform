import type { SectionConfig } from '@/lib/websiteContentDefaults';

export interface WebsiteContent {
  metaTitle?: string;
  marquee: {
    enabled: boolean;
    messages: string[];
    gradientFrom: string;
    gradientTo: string;
  };
  contact: {
    registrationNumber: string;
  };
  contactPage?: {
    headline: string;
    subheadline: string;
    mapEmbedUrl: string;
    phone: string;
    email: string;
    address: string;
  };
  aboutPage?: {
    heading: string;
    description: string;
    aboutContent: string;
    imageUrl: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram?: string;
    youtube?: string;
  };
  branding: {
    logoText: string;
    logoTextColor1: string;
    logoTextColor2: string;
    logoIconColor1: string;
    logoIconColor2: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  navigation: {
    home: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    category: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    pages: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    courses: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
    };
    account: {
      label: string;
      items: Array<{ label: string; href: string; icon?: string }>;
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
      href?: string;
    };
    login: {
      text: string;
      href: string;
    };
  };
  mobileMenu: {
    items: Array<{ label: string; href: string }>;
  };
  partners?: {
    title: string;
    items: Array<{ name: string; imageUrl: string; href: string }>;
  };
  hero: {
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
  };
  about?: {
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
  };
  whyChooseUs?: {
    sectionHeading?: string;
    sectionSubtitle?: string;
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
    features: Array<{
      id: number;
      title: string;
      titleBn: string;
      description: string;
      descriptionBn: string;
      iconType: 'money' | 'instructor' | 'flexible' | 'community';
    }>;
  };
  statistics?: {
    items: Array<{
      id: number;
      number: string;
      suffix: string;
      label: string;
      labelBengali: string;
      iconType: 'students' | 'courses' | 'tutors' | 'awards';
    }>;
  };
  services?: {
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
    services: Array<{
      id: number;
      title: string;
      titleBengali: string;
      description: string;
      iconType: 'online-courses' | 'live-classes' | 'certification' | 'expert-support' | 'career-guidance' | 'lifetime-access';
    }>;
    batchSection?: {
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
      onlineLevels: Array<{
        id: string;
        label: string;
        subtitle: string;
        color: string;
      }>;
      offlineLevels: Array<{
        id: string;
        label: string;
        subtitle: string;
        color: string;
      }>;
    };
  };
  certificates?: {
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
    certificates: Array<{
      id: number;
      titleBengali: string;
      titleEnglish: string;
      imageUrl: string;
      description?: string;
    }>;
    about: {
      title: string;
      description: string[];
      imageUrl: string;
      name: string;
      affiliation: string;
    };
  };
  photoGallery?: {
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
    images: Array<{
      id: number;
      image: string;
      alt: string;
    }>;
  };
  blog?: {
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
    posts: Array<{
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
    }>;
  };
  courses?: {
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
    featuredCourseIds?: string[];
  };
  coursesByCategory?: {
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
  };
  sectionOrder?: SectionConfig[];
  faq?: {
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
    faqs: Array<{
      id: number;
      question: string;
      answer: string;
      order: number;
    }>;
  };
  promotionalBanner?: {
    enabled: boolean;
    imageUrl: string;
    link: string;
    headline: string;
    subtext: string;
    ctaLabel: string;
  };
  courseLessonBanner?: {
    enabled: boolean;
    title: string;
    imageUrl: string;
  };
  downloadApp?: {
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
      part6: string;
      part7: string;
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
  };
  footer?: {
    branding: {
      logoText: string;
      logoIcon: string;
      logoIconColor: string;
      logoTextColor: string;
      description: string;
    };
    newsletter: {
      title: string;
      emailPlaceholder: string;
      buttonText: string;
      buttonGradientFrom: string;
      buttonGradientTo: string;
    };
    companyLinks: Array<{
      label: string;
      href: string;
    }>;
    quickLinks: Array<{
      label: string;
      href: string;
    }>;
    contact: {
      address: {
        label: string;
        value: string;
      };
      phone: {
        label: string;
        value: string;
      };
      email: {
        label: string;
        value: string;
      };
    };
    paymentGateway?: {
      title: string;
      methods: string[];
    };
    copyright: string;
    socialMedia?: Array<{
      name: string;
      icon: string;
      color: string;
      href: string;
    }>;
    backgroundGradient: {
      from: string;
      to: string;
    };
  };
}
