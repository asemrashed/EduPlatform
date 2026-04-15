import { getAboutContent } from '@/lib/website-content';
import About from '@/app/components/About';

export default async function AboutWrapper() {
  // Fetch about content server-side with caching
  const aboutContent = await getAboutContent();
  
  // Pass content as prop to avoid client-side flash
  return <About initialContent={aboutContent} />;
}

