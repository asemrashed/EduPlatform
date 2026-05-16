import "server-only";
import { unstable_cache } from "next/cache";
import connectDB from "@/lib/mongodb";
import {
  defaultAboutContent,
  defaultBlogContent,
  defaultCertificatesContent,
  defaultCourseLessonBannerContent,
  defaultCoursesByCategoryContent,
  defaultCoursesContent,
  defaultDownloadAppContent,
  defaultFooterContent,
  defaultHeroContent,
  defaultPhotoGalleryContent,
  defaultServicesContent,
  defaultStatisticsContent,
  defaultWebsiteContent,
  defaultWhyChooseUsContent,
  WEBSITE_CONTENT_CATEGORY,
  type AboutContent,
  type BlogContent,
  type CertificatesContent,
  type CoursesByCategoryContent,
  type CoursesContent,
  type DownloadAppContent,
  type FooterContent,
  type HeroContent,
  type PhotoGalleryContent,
  type ServicesContent,
  type StatisticsContent,
  type WebsiteContent,
  type WhyChooseUsContent,
} from "@/lib/websiteContentDefaults";

export type { WebsiteContent };

// Server-side function to get website content with caching
export async function getWebsiteContent(): Promise<WebsiteContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultWebsiteContent;
  }

  const getCachedContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        return (settings?.settings as WebsiteContent | undefined) || defaultWebsiteContent;
      } catch (error) {
        console.error('Error fetching website content:', error);
        return defaultWebsiteContent;
      }
    },
    ['website-content'],
    {
      tags: ['website-content'],
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedContent();
}

// Server-side function to get hero content with caching
export async function getHeroContent(): Promise<HeroContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultHeroContent;
  }

  const getCachedHeroContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return hero content if available, otherwise return default
        if (websiteContent?.hero) {
          return websiteContent.hero;
        }
        return defaultHeroContent;
      } catch (error) {
        console.error('Error fetching hero content:', error);
        return defaultHeroContent;
      }
    },
    ['hero-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedHeroContent();
}

// Server-side function to get about content with caching
export async function getAboutContent(): Promise<AboutContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultAboutContent;
  }

  const getCachedAboutContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return about content if available, otherwise return default
        if (websiteContent?.about) {
          return websiteContent.about;
        }
        return defaultAboutContent;
      } catch (error) {
        console.error('Error fetching about content:', error);
        return defaultAboutContent;
      }
    },
    ['about-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedAboutContent();
}

// Server-side function to get why choose us content with caching
export async function getWhyChooseUsContent(): Promise<WhyChooseUsContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultWhyChooseUsContent;
  }

  const getCachedWhyChooseUsContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return why choose us content if available, otherwise return default
        if (websiteContent?.whyChooseUs) {
          return websiteContent.whyChooseUs;
        }
        return defaultWhyChooseUsContent;
      } catch (error) {
        console.error('Error fetching why choose us content:', error);
        return defaultWhyChooseUsContent;
      }
    },
    ['why-choose-us-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedWhyChooseUsContent();
}

// Server-side function to get statistics content with caching
export async function getStatisticsContent(): Promise<StatisticsContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultStatisticsContent;
  }

  const getCachedStatisticsContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return statistics content if available, otherwise return default
        if (websiteContent?.statistics) {
          return websiteContent.statistics;
        }
        return defaultStatisticsContent;
      } catch (error) {
        console.error('Error fetching statistics content:', error);
        return defaultStatisticsContent;
      }
    },
    ['statistics-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedStatisticsContent();
}

// Server-side function to get services content with caching
export async function getServicesContent(): Promise<ServicesContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultServicesContent;
  }

  const getCachedServicesContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return services content if available, otherwise return default
        if (websiteContent?.services) {
          return websiteContent.services;
        }
        return defaultServicesContent;
      } catch (error) {
        console.error('Error fetching services content:', error);
        return defaultServicesContent;
      }
    },
    ['services-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedServicesContent();
}

// Server-side function to get certificates content with caching
export async function getCertificatesContent(): Promise<CertificatesContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultCertificatesContent;
  }

  const getCachedCertificatesContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return certificates content if available, otherwise return default
        if (websiteContent?.certificates) {
          return websiteContent.certificates;
        }
        return defaultCertificatesContent;
      } catch (error) {
        console.error('Error fetching certificates content:', error);
        return defaultCertificatesContent;
      }
    },
    ['certificates-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: 60, // Revalidate every 60 seconds
    }
  );

  return await getCachedCertificatesContent();
}

// Server-side function to get photo gallery content with caching
export async function getPhotoGalleryContent(): Promise<PhotoGalleryContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultPhotoGalleryContent;
  }

  const getCachedPhotoGalleryContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return photo gallery content if available, otherwise return default
        if (websiteContent?.photoGallery) {
          return websiteContent.photoGallery;
        }
        return defaultPhotoGalleryContent;
      } catch (error) {
        console.error('Error fetching photo gallery content:', error);
        return defaultPhotoGalleryContent;
      }
    },
    ['photo-gallery-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedPhotoGalleryContent();
}

// Server-side function to get blog content with caching
export async function getBlogContent(): Promise<BlogContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultBlogContent;
  }

  const getCachedBlogContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return blog content if available, otherwise return default
        if (websiteContent?.blog) {
          return websiteContent.blog;
        }
        return defaultBlogContent;
      } catch (error) {
        console.error('Error fetching blog content:', error);
        return defaultBlogContent;
      }
    },
    ['blog-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedBlogContent();
}

// Server-side function to get download app content with caching
export async function getDownloadAppContent(): Promise<DownloadAppContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultDownloadAppContent;
  }

  const getCachedDownloadAppContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return download app content if available, otherwise return default
        if (websiteContent?.downloadApp) {
          return websiteContent.downloadApp;
        }
        return defaultDownloadAppContent;
      } catch (error) {
        console.error('Error fetching download app content:', error);
        return defaultDownloadAppContent;
      }
    },
    ['download-app-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedDownloadAppContent();
}

// Server-side function to get footer content with caching
export async function getFooterContent(): Promise<FooterContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultFooterContent;
  }

  const getCachedFooterContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return footer content if available, otherwise return default
        if (websiteContent?.footer) {
          return websiteContent.footer;
        }
        return defaultFooterContent;
      } catch (error) {
        console.error('Error fetching footer content:', error);
        return defaultFooterContent;
      }
    },
    ['footer-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedFooterContent();
}

// Server-side function to get courses content with caching
export async function getCoursesContent(): Promise<CoursesContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultCoursesContent;
  }

  const getCachedCoursesContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Merge DB courses with default so featuredCourseIds and all fields are preserved
        const merged = {
          ...defaultCoursesContent,
          ...(websiteContent?.courses || {}),
          label: { ...defaultCoursesContent.label, ...(websiteContent?.courses?.label || {}) },
          title: { ...defaultCoursesContent.title, ...(websiteContent?.courses?.title || {}) },
          titleColors: { ...defaultCoursesContent.titleColors, ...(websiteContent?.courses?.titleColors || {}) },
          gradientColors: { ...defaultCoursesContent.gradientColors, ...(websiteContent?.courses?.gradientColors || {}) },
        };
        if (websiteContent?.courses?.featuredCourseIds != null) {
          (merged as any).featuredCourseIds = websiteContent.courses.featuredCourseIds;
        }
        return merged as CoursesContent;
      } catch (error) {
        console.error('Error fetching courses content:', error);
        return defaultCoursesContent;
      }
    },
    ['courses-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedCoursesContent();
}

// Server-side function to get courses by category content with caching
export async function getCoursesByCategoryContent(): Promise<CoursesByCategoryContent> {
  // Prevent execution in browser
  if (typeof window !== 'undefined') {
    return defaultCoursesByCategoryContent;
  }

  const getCachedCoursesByCategoryContent = unstable_cache(
    async () => {
      try {
        await connectDB();
        // Dynamic import to prevent client-side bundling
        const Settings = (await import('@/models/Settings')).default;
        const settings = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY });
        const websiteContent = settings?.settings;
        
        // Return courses by category content if available, otherwise return default
        if (websiteContent?.coursesByCategory) {
          return websiteContent.coursesByCategory;
        }
        return defaultCoursesByCategoryContent;
      } catch (error) {
        console.error('Error fetching courses by category content:', error);
        return defaultCoursesByCategoryContent;
      }
    },
    ['courses-by-category-content'],
    {
      tags: ['website-content'], // Same tag so it revalidates with website content
      revalidate: false, // No time-based revalidation
    }
  );

  return await getCachedCoursesByCategoryContent();
}
