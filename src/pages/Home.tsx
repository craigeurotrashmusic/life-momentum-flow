
import { useEffect, useRef, lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
import EpochTracker from '@/components/organisms/EpochTracker';
import FocusCard from '@/components/cards/FocusCard';
// import HabitCard from '@/components/cards/HabitCard'; // Eager import removed
import SupplementCard from '@/components/cards/SupplementCard';
import ReviewCard from '@/components/cards/ReviewCard';
import SimulationCard from '@/components/cards/SimulationCard';
import { useToast } from '@/components/ui/use-toast';
import ClarityHubCard from '@/components/organisms/ClarityHubCard';
import { Skeleton } from '@/components/ui/skeleton'; // For fallback

const NudgeCard = lazy(() => import('@/components/cards/NudgeCard'));
const HabitCard = lazy(() => import('@/components/cards/HabitCard')); // Lazy import HabitCard

const Home = () => {
  const { toast } = useToast();
  // scrollContainerRef is no longer needed for the custom scroll logic
  // const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome toast for demo purposes
    toast({
      title: "Welcome to Momentum OS",
      description: "Your life dashboard is ready",
    });
    
    // Removed the custom scroll handling logic that caused snapping.
    // The smooth scrolling will now be handled by CSS on the main container.
  }, [toast]);

  const CardSkeleton = () => (
    <div className="card-stack-item bg-secondary/20 rounded-2xl shadow-lg p-5 h-[200px] flex items-center justify-center">
      <Skeleton className="w-3/4 h-8" />
    </div>
  );
  
  const NudgeCardSkeleton = () => (
     <div className="card-stack-item bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl shadow-lg p-5 h-[400px] flex items-center justify-center">Loading Nudge Card...</div>
  );


  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      {/* 
        Updated main element:
        - Removed ref={scrollContainerRef} as it's no longer used by the removed JS.
        - Added `overflow-y-auto` to ensure it's the scroll container.
        - Added `scroll-smooth` Tailwind class for `scroll-behavior: smooth;`.
      */}
      <main className="pt-16 container mx-auto h-screen overflow-y-auto scroll-smooth">
        {/* 
          The div with `card-stack` class will no longer be a scroll container itself.
          It will lay out its children within the scrollable `main` element.
        */}
        <div className="card-stack no-scrollbar pb-20">
          <ClarityHubCard />
          <EpochTracker /> 
          <FocusCard />
          <Suspense fallback={<CardSkeleton />}>
            <HabitCard />
          </Suspense>
          <Suspense fallback={<NudgeCardSkeleton />}>
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

