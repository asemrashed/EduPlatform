import { getWhyChooseUsContent } from '@/lib/website-content';
import WhyChooseUs from '@/app/components/WhyChooseUs';

export default async function WhyChooseUsWrapper() {
  // Fetch why choose us content server-side with caching
  const whyChooseUsContent = await getWhyChooseUsContent();
  
  // Pass content as prop to avoid client-side flash
  return <WhyChooseUs initialContent={whyChooseUsContent} />;
}

