import { useState } from 'react';
import { CheckCheck, Calendar, Check } from 'lucide-react';
import LifeCard from './LifeCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completedDays: number[];
  streak: number;
  color?: string;
}

const initialHabits: Habit[] = [
  { id: '1', name: 'Morning Meditation', emoji: '🧘', completedDays: [0, 1, 2, 4], streak: 4 },
  { id: '2', name: 'Read 30 mins', emoji: '📚', completedDays: [0, 1, 3, 4, 5], streak: 2 },
  { id: '3', name: 'Exercise', emoji: '💪', completedDays: [1, 3, 5], streak: 1 },
];

const HabitCard = () => {
  const [habits, setHabits] = useState(initialHabits);
  const currentDay = new Date().getDay();
  const isMobile = useIsMobile();
  
  const toggleHabitCompletion = (habitId: string, day: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const updatedDays = habit.completedDays.includes(day)
            ? habit.completedDays.filter(d => d !== day)
            : [...habit.completedDays, day];
          
          return {
            ...habit,
            completedDays: updatedDays,
            streak: day === currentDay ? 
              (updatedDays.includes(day) ? habit.streak + 1 : Math.max(0, habit.streak - 1)) : 
              habit.streak
          };
        }
        return habit;
      })
    );
  };

  return (
    <LifeCard 
      title="Habit Tracker" 
      icon={<CheckCheck className="text-primary" />}
      color="bg-gradient-to-br from-green-800/50 to-teal-800/50"
      expandable={true}
      defaultExpanded={true}
    >
      <div className="mt-2 space-y-4">
        {habits.map(habit => (
          <div key={habit.id} className="glass-card p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center min-w-0">
                <span className="mr-2 text-xl sm:text-2xl">{habit.emoji}</span>
                <span className="text-sm sm:text-base font-medium text-foreground truncate">{habit.name}</span>
              </div>
              <div className="text-sm sm:text-base font-semibold text-primary flex-shrink-0 ml-2">
                {habit.streak}🔥
              </div>
            </div>
            <div className={`grid grid-cols-7 gap-1 ${isMobile ? 'sm:gap-1.5' : 'gap-1.5'}`}>
              {DAYS_OF_WEEK.map((dayLabel, dayIndex) => {
                const isCompleted = habit.completedDays.includes(dayIndex);
                return (
                  <button
                    key={dayIndex}
                    onClick={() => toggleHabitCompletion(habit.id, dayIndex)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background_card
                      ${isCompleted 
                        ? (habit.color || 'bg-primary') + ' text-primary-foreground hover:opacity-80' 
                        : 'bg-secondary/60 hover:bg-secondary/90 text-muted-foreground'}`}
                    aria-label={`${isCompleted ? 'Mark as not completed' : 'Mark as completed'}: ${habit.name} on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex]}`}
                    aria-pressed={isCompleted}
                  >
                    {isCompleted ? <Check size={isMobile ? 14 : 16} /> : <span className="text-xs">{dayLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2 flex items-center text-muted-foreground">
            <Calendar size={16} className="mr-2" /> Weekly Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {habits.map(habit => (
              <div key={`summary-${habit.id}`} className="glass-card p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <span className="text-lg mr-1.5">{habit.emoji}</span>
                  <span className="text-xs text-foreground truncate">{habit.name}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-muted-foreground">
                    {habit.completedDays.length}/7 days
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {habit.streak}🔥
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-6 text-muted-foreground hover:text-primary hover:border-primary/50">
          Add New Habit
        </Button>
      </div>
    </LifeCard>
  );
};

export default HabitCard;
