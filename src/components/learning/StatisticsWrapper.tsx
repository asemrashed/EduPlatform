import { getStatisticsContent } from '@/lib/website-content';
import Statistics from '@/app/components/Statistics';

export default async function StatisticsWrapper() {
  // Fetch statistics content server-side with caching
  const statisticsContent = await getStatisticsContent();
  
  // Pass content as prop to avoid client-side flash
  return <Statistics initialContent={statisticsContent} />;
}

