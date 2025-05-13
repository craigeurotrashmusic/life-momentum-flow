
import { useState } from 'react';
import { BookOpen, BarChart } from 'lucide-react';
import LifeCard from './LifeCard';
import { Progress } from "@/components/ui/progress";

const ClarityCard = () => {
  const [visionScore, setVisionScore] = useState(82);
  const [wealthScore, setWealthScore] = useState(68);
  
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
        
        <button 
          className="w-full py-3 mt-4 rounded-xl bg-primary/20 hover:bg-primary/30 transition-colors flex items-center justify-center gap-2"
        >
          <BarChart size={16} />
          <span>View Detailed Dashboard</span>
        </button>
      </div>
    </LifeCard>
  );
};

export default ClarityCard;
