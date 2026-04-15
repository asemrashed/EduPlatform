import { getHeroContent } from '@/lib/website-content';
import Hero from '@/app/components/Hero';

export default async function HeroWrapper() {
  // Fetch hero content server-side with caching
  const heroContent = await getHeroContent();
  
  // Pass content as prop to avoid client-side flash
  return <Hero initialContent={heroContent} />;
}

