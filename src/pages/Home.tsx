
import { useEffect, useRef } from 'react';
import Header from '@/components/layout/Header';
import EpochCard from '@/components/cards/EpochCard';
import FocusCard from '@/components/cards/FocusCard';
import HabitCard from '@/components/cards/HabitCard';
import ClarityCard from '@/components/cards/ClarityCard';
import SupplementCard from '@/components/cards/SupplementCard';
import ReviewCard from '@/components/cards/ReviewCard';
import { useToast } from '@/components/ui/use-toast';

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
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      <main ref={scrollContainerRef} className="pt-16 container mx-auto h-screen">
        <div className="card-stack no-scrollbar pb-20">
          <EpochCard />
          <FocusCard />
          <HabitCard />
          <ClarityCard />
          <SupplementCard />
          <ReviewCard />
        </div>
      </main>
    </div>
  );
};

export default Home;
