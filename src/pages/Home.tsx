
import { useEffect, useRef, lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
// Removed EpochCard import
// import EpochCard from '@/components/cards/EpochCard'; 
import EpochTracker from '@/components/organisms/EpochTracker'; // Added EpochTracker import
import FocusCard from '@/components/cards/FocusCard';
import HabitCard from '@/components/cards/HabitCard';
import SupplementCard from '@/components/cards/SupplementCard';
import ReviewCard from '@/components/cards/ReviewCard';
import SimulationCard from '@/components/cards/SimulationCard';
import { useToast } from '@/components/ui/use-toast';
import ClarityHubCard from '@/components/organisms/ClarityHubCard';

// Lazy load the Nudge Card for better performance
const NudgeCard = lazy(() => import('@/components/cards/NudgeCard'));

const Home = () => {
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome toast for demo purposes
    toast({
      title: "Welcome to Momentum OS",
      description: "Your life dashboard is ready",
    });
    
    // Add smooth scrolling with snap behavior
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      // Find closest snap point when user stops scrolling
      const scrollTimeout = setTimeout(() => {
        const scrollPosition = container.scrollTop;
        const containerHeight = container.clientHeight;
        const closestSnapPoint = Math.round(scrollPosition / containerHeight) * containerHeight;
        
        container.scrollTo({
          top: closestSnapPoint,
          behavior: 'smooth'
        });
      }, 100);
      
      return () => clearTimeout(scrollTimeout);
    };
    
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scrollend', handleScroll);
      return () => container.removeEventListener('scrollend', handleScroll);
    }
  }, [toast]); // Added toast to dependency array as it was missing before

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      <main ref={scrollContainerRef} className="pt-16 container mx-auto h-screen">
        <div className="card-stack no-scrollbar pb-20">
          <ClarityHubCard />
          {/* Replaced EpochCard with EpochTracker */}
          <EpochTracker /> 
          <FocusCard />
          <HabitCard />
          <Suspense fallback={<div className="card-stack-item bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl shadow-lg p-5 h-[400px] flex items-center justify-center">Loading Nudge Card...</div>}>
            <NudgeCard />
          </Suspense>
          <SimulationCard />
          <SupplementCard />
          <ReviewCard />
        </div>
      </main>
    </div>
  );
};

export default Home;
