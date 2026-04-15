export interface PromoBannerContent {
  enabled: boolean;
  /** Banner image URL (optional; if empty, gradient banner is shown) */
  imageUrl: string;
  /** Link URL when banner is clicked */
  link: string;
  headline: string;
  subtext: string;
  /** CTA button label */
  ctaLabel: string;
}

export const defaultPromoBannerContent: PromoBannerContent = {
  enabled: true,
  imageUrl: '',
  link: '/#courses',
  headline: 'আরও কোর্স এক্সপ্লোর করুন',
  subtext: 'নতুন কোর্সে বিশেষ ছাড় পেতে এখনই দেখুন',
  ctaLabel: 'দেখুন',
};
