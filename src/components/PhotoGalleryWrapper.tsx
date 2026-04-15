import { getPhotoGalleryContent } from '@/lib/website-content';
import PhotoGallery from '@/app/components/PhotoGallery';

export default async function PhotoGalleryWrapper() {
  // Fetch photo gallery content server-side with caching
  const photoGalleryContent = await getPhotoGalleryContent();
  
  // Pass content as prop to avoid client-side flash
  return <PhotoGallery initialContent={photoGalleryContent} />;
}

