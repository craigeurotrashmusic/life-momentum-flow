
import { useState } from 'react';
import { BookOpen, BarChart, TrendingUp } from 'lucide-react';
import LifeCard from './LifeCard';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const ClarityCard = () => {
  const [visionScore, setVisionScore] = useState(82);
  const [wealthScore, setWealthScore] = useState(68);
  const [healthScore, setHealthScore] = useState(74);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock core values
  const coreValues = [
    { name: "Growth", score: 85 },
    { name: "Balance", score: 72 },
    { name: "Freedom", score: 91 },
    { name: "Connection", score: 64 }
  ];
  
  // Mock long-term goals
  const longTermGoals = [
    { name: "Financial Independence", progress: 45, target: "2030" },
    { name: "Health Optimization", progress: 62, target: "2025" },
    { name: "Skill Mastery", progress: 38, target: "2026" }
  ];
  
  return (
    <LifeCard 
      title="Clarity Hub" 
      icon={<BookOpen />}
      color="bg-gradient-to-br from-indigo-900/30 to-purple-900/30"
      expandable={true}
    >
      <div className="mt-2">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Vision Alignment</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current score</span>
            <span className="font-semibold">{visionScore}%</span>
          </div>
          <Progress value={visionScore} className="h-2 bg-secondary/50" />
          <p className="text-xs text-muted-foreground mt-2">
            You're making good progress on your long-term vision goals
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Wealth Alignment</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Current score</span>
            <span className="font-semibold">{wealthScore}%</span>
          </div>
          <Progress value={wealthScore} className="h-2 bg-secondary/50" />
          <p className="text-xs text-muted-foreground mt-2">
            Your spending patterns align with your financial goals
          </p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Health Metrics</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall health</span>
            <span className="font-semibold">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2 bg-secondary/50" />
          <p className="text-xs text-muted-foreground mt-2">
            Supplement and habit tracking contributing positively
          </p>
        </div>
        
        <button 
          className="w-full py-3 mt-4 rounded-xl bg-primary/20 hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <BarChart size={16} />
          <span>View Detailed Dashboard</span>
        </button>
      </div>
      
      {/* Detailed Dashboard Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Clarity Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <TrendingUp size={18} className="mr-2" />
              Core Values Alignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {coreValues.map((value) => (
                <div key={value.name} className="p-4 bg-secondary/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{value.name}</span>
                    <span className="text-sm font-semibold">{value.score}%</span>
                  </div>
                  <Progress value={value.score} className="h-2 bg-secondary/50" />
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium my-4">Long-term Goals</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {longTermGoals.map((goal) => (
                  <CarouselItem key={goal.name} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4 bg-secondary/30 rounded-xl h-full">
                      <h4 className="font-medium mb-1">{goal.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">Target: {goal.target}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Progress</span>
                        <span className="text-sm font-semibold">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2 bg-secondary/50" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            
            <h3 className="text-lg font-medium my-4">Connected Data Insights</h3>
            <div className="p-4 bg-secondary/30 rounded-xl mb-4">
              <h4 className="font-medium mb-2">Supplement & Habit Impact</h4>
              <p className="text-sm text-muted-foreground">
                Your consistent meditation habit has improved focus score by 15%
              </p>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-xl">
              <h4 className="font-medium mb-2">Financial Impact</h4>
              <p className="text-sm text-muted-foreground">
                Reduced discretionary spending this month has improved your wealth alignment score
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default ClarityCard;
