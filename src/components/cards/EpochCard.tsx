
import { Calendar } from 'lucide-react';
import LifeCard from './LifeCard';

const weekData = [
  { week: 'Week 1', focus: 'Strategy planning', progress: 80 },
  { week: 'Week 2', focus: 'Client meetings', progress: 65 },
  { week: 'Week 3', focus: 'Development sprint', progress: 90 },
  { week: 'Week 4', focus: 'Launch preparation', progress: 40 }
];

const EpochCard = () => {
  return (
    <LifeCard 
      title="Current Epoch: Building Momentum" 
      icon={<Calendar />}
      color="bg-gradient-to-br from-purple-900/30 to-blue-900/30"
      expandable={true}
    >
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">May 2025 - June 2025</p>
        <h3 className="text-lg font-medium mt-1">Q2 Project Launch</h3>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Week 8 of 12</span>
          <span>65% Complete</span>
        </div>
      </div>

      <div className="carousel no-scrollbar -mx-5 px-5">
        {weekData.map((item) => (
          <div key={item.week} className="carousel-item glass-card rounded-xl p-4">
            <h4 className="font-medium mb-2">{item.week}</h4>
            <p className="text-sm text-muted-foreground mb-3">{item.focus}</p>
            <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-right text-muted-foreground">
              {item.progress}% complete
            </div>
          </div>
        ))}
      </div>
    </LifeCard>
  );
};

export default EpochCard;
