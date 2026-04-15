import { getServicesContent } from '@/lib/website-content';
import Services from '@/app/components/Services';

export default async function ServicesWrapper() {
  // Fetch services content server-side with caching
  const servicesContent = await getServicesContent();
  
  // Pass content as prop to avoid client-side flash
  return <Services initialContent={servicesContent} />;
}

