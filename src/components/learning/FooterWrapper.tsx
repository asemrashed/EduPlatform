import { getFooterContent } from '@/lib/website-content';
import Footer from '@/app/components/Footer';

export default async function FooterWrapper() {
  try {
    // Fetch footer content server-side with caching (with timeout fallback)
    const footerContent = await Promise.race([
      getFooterContent(),
      new Promise((resolve) => 
        setTimeout(() => resolve(null), 5000)
      )
    ]);
  
  // Pass content as prop to avoid client-side flash
    // If content fetch fails, Footer will use its own default
    return <Footer initialContent={footerContent as any} />;
  } catch (error) {
    console.error('Error in FooterWrapper:', error);
    // Return footer with no initial content - it will fetch client-side
    return <Footer />;
  }
}

