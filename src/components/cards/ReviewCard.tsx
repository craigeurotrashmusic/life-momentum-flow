
import { CalendarCheck, BookOpen } from 'lucide-react';
import LifeCard from './LifeCard';
import { Button } from '@/components/ui/button';

const ReviewCard = () => {
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);
  
  const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
  
  return (
    <LifeCard 
      title="Weekly Review" 
      icon={<CalendarCheck />}
      color="bg-gradient-to-br from-amber-900/30 to-orange-900/30"
    >
      <div className="mt-2">
        <p className="text-sm text-muted-foreground mb-4">
          {formattedDate}
        </p>
        
        {isWeekend ? (
          <div className="space-y-4">
            <p className="text-lg">
              "The quality of your life is determined by the quality of your questions."
            </p>
            <p className="text-sm text-muted-foreground">― Tony Robbins</p>
            
            <div className="mt-6 flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                size="lg"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Start Weekly Review
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                size="lg"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Previous Reviews
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-2">Your weekly review will be available on Sunday</p>
            <p className="text-xs text-muted-foreground">
              Focus on completing your daily habits and tasks until then
            </p>
          </div>
        )}
      </div>
    </LifeCard>
  );
};

export default ReviewCard;
