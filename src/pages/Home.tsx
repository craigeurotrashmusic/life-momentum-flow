
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import EpochCard from '@/components/cards/EpochCard';
import FocusCard from '@/components/cards/FocusCard';
import HabitCard from '@/components/cards/HabitCard';
import { useToast } from '@/components/ui/use-toast';

const Home = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Welcome toast for demo purposes
    toast({
      title: "Welcome to Momentum OS",
      description: "Your life dashboard is ready",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      <main className="pt-16 container mx-auto">
        <div className="card-stack no-scrollbar pb-20">
          <EpochCard />
          <FocusCard />
          <HabitCard />
        </div>
      </main>
    </div>
  );
};

export default Home;
