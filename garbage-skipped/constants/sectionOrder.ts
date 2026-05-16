// Section identifiers that match the component names
export type SectionId = 
  | 'header'
  | 'hero'
  | 'about'
  | 'courses'
  | 'whyChooseUs'
  | 'statistics'
  | 'services'
  | 'certificates'
  | 'coursesByCategory'
  | 'testimonials'
  | 'photoGallery'
  | 'blog'
  | 'downloadApp'
  | 'footer';

export interface SectionConfig {
  id: SectionId;
  label: string;
  enabled: boolean;
  order: number;
}

export const defaultSectionOrder: SectionConfig[] = [
  { id: 'header', label: 'Header', enabled: true, order: 0 },
  { id: 'hero', label: 'Hero', enabled: true, order: 1 },
  { id: 'about', label: 'About', enabled: true, order: 2 },
  { id: 'courses', label: 'Courses', enabled: true, order: 3 },
  { id: 'whyChooseUs', label: 'Why Choose Us', enabled: true, order: 4 },
  { id: 'statistics', label: 'Statistics', enabled: true, order: 5 },
  { id: 'services', label: 'Services', enabled: true, order: 6 },
  { id: 'certificates', label: 'Certificates', enabled: true, order: 7 },
  { id: 'coursesByCategory', label: 'Courses By Category', enabled: true, order: 8 },
  { id: 'testimonials', label: 'Testimonials', enabled: true, order: 9 },
  { id: 'photoGallery', label: 'Photo Gallery', enabled: true, order: 10 },
  { id: 'blog', label: 'Blog', enabled: true, order: 11 },
  { id: 'downloadApp', label: 'Download App', enabled: true, order: 12 },
  { id: 'footer', label: 'Footer', enabled: true, order: 13 },
];

