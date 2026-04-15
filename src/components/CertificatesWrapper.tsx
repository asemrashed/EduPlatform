import { getCertificatesContent } from '@/lib/website-content';
import Certificates from '@/app/components/Certificates';

export default async function CertificatesWrapper() {
  // Fetch certificates content server-side with caching
  const certificatesContent = await getCertificatesContent();
  
  // Pass content as prop to avoid client-side flash
  return <Certificates initialContent={certificatesContent} />;
}

