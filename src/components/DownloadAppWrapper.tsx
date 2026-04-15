import { getDownloadAppContent } from '@/lib/website-content';
import DownloadApp from '@/app/components/DownloadApp';

export default async function DownloadAppWrapper() {
  // Fetch download app content server-side with caching
  const downloadAppContent = await getDownloadAppContent();
  
  // Pass content as prop to avoid client-side flash
  return <DownloadApp initialContent={downloadAppContent} />;
}

