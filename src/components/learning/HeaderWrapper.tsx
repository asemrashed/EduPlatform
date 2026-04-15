import { getWebsiteContent } from '@/lib/website-content';
import Header from '@/app/components/Header';

export default async function HeaderWrapper() {
  try {
    // Fetch content server-side with caching (with timeout fallback)
    const content = await Promise.race([
      getWebsiteContent(),
      new Promise((resolve) => 
        setTimeout(() => resolve(null), 5000)
      )
    ]);
  
  // Pass content as prop to avoid client-side flash
    // If content fetch fails, Header will use its own default
    return <Header initialContent={content as any} />;
  } catch (error) {
    console.error('Error in HeaderWrapper:', error);
    // Return header with no initial content - it will fetch client-side
    return <Header />;
  }
}

