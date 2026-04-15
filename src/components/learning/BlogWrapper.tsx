import { getBlogContent } from '@/lib/website-content';
import Blog from '@/app/components/Blog';

export default async function BlogWrapper() {
  // Fetch blog content server-side with caching
  const blogContent = await getBlogContent();
  
  // Pass content as prop to avoid client-side flash
  return <Blog initialContent={blogContent} />;
}

