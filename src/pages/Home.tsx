
import { useEffect, useRef, lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
import EpochTracker from '@/components/organisms/EpochTracker';
import FocusCard from '@/components/organisms/FocusCard';
import SupplementCard from '@/components/cards/SupplementCard';
import ReviewCard from '@/components/cards/ReviewCard';
import SimulationCard from '@/components/cards/SimulationCard';
import { useToast } from '@/components/ui/use-toast';
import ClarityHubCard from '@/components/organisms/ClarityHubCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

const NudgeCard = lazy(() => import('@/components/cards/NudgeCard'));
const HabitCard = lazy(() => import('@/components/cards/HabitCard'));

const Home = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Welcome toast for demo purposes
    toast({
      title: "Welcome to Momentum OS",
      description: "Your life dashboard is ready",
    });
  }, [toast]);

  const CardSkeleton = () => (
    <div className="card-stack-item bg-secondary/20 rounded-2xl shadow-lg p-4 sm:p-5 h-[200px] flex items-center justify-center">
      <Skeleton className="w-3/4 h-8" />
    </div>
  );
  
  const NudgeCardSkeleton = () => (
     <div className="card-stack-item bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl shadow-lg p-4 sm:p-5 h-[400px] flex items-center justify-center">
       <div className="flex flex-col items-center gap-3">
         <Skeleton className="w-12 h-12 rounded-full" />
         <Skeleton className="w-40 h-6" />
         <Skeleton className="w-32 h-4" />
       </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      <main className="pt-16 container mx-auto h-screen overflow-y-auto scroll-smooth px-4 sm:px-6">
        <div className="card-stack no-scrollbar pb-20 sm:pb-24">
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
