
import { useState } from 'react';
import { CheckCheck, Calendar } from 'lucide-react';
import LifeCard from './LifeCard';
import { useIsMobile } from '@/hooks/use-mobile';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Habit {
  id: string;
  name: string;
  emoji: string;
  completedDays: number[];
  streak: number;
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
            // Simple streak calculation for demo
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
      icon={<CheckCheck />}
      color="bg-gradient-to-br from-green-900/30 to-teal-900/30"
      expandable={true}
    >
      <div className="mt-2 overflow-x-auto">
        {/* Mobile view shows compressed version */}
        {isMobile ? (
          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="glass-card p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{habit.emoji}</span>
                    <span className="text-sm truncate">{habit.name}</span>
                  </div>
                  <div className="text-sm font-semibold">
                    {habit.streak}🔥
                  </div>
                </div>
                <div className="flex justify-between">
                  {DAYS_OF_WEEK.map((day, dayIndex) => (
                    <button
                      key={dayIndex}
                      onClick={() => toggleHabitCompletion(habit.id, dayIndex)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
                        ${habit.completedDays.includes(dayIndex) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary/50 text-muted-foreground'}`}
                      aria-label={`${habit.completedDays.includes(dayIndex) ? 'Completed' : 'Not completed'} ${day}`}
                    >
                      {habit.completedDays.includes(dayIndex) && <CheckCheck size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex mb-3">
              <div className="w-[120px]"></div>
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={day} className="flex-1 text-center text-xs">
                  <span className={currentDay === index ? "text-primary font-semibold" : ""}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center">
                  <div className="w-[120px] flex items-center">
                    <span className="mr-2 text-lg">{habit.emoji}</span>
                    <span className="text-sm truncate">{habit.name}</span>
                  </div>
                  
                  {DAYS_OF_WEEK.map((_, dayIndex) => (
                    <div key={dayIndex} className="flex-1 flex justify-center">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, dayIndex)}
                        className={`w-8 h-8 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors
                          ${habit.completedDays.includes(dayIndex) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary/50 text-muted-foreground'}`}
                        aria-label={`${habit.completedDays.includes(dayIndex) ? 'Completed' : 'Not completed'} ${DAYS_OF_WEEK[dayIndex]}`}
                      >
                        {habit.completedDays.includes(dayIndex) && <CheckCheck size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Calendar size={14} className="mr-1" /> Weekly Progress
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {habits.map(habit => (
              <div key={habit.id} className="glass-card p-3 rounded-xl">
                <div className="flex items-center mb-1">
                  <span className="text-lg mr-1">{habit.emoji}</span>
                  <span className="text-xs">{habit.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-xs text-muted-foreground">
                    {habit.completedDays.length}/7 days
                  </div>
                  <div className="text-sm font-semibold">
                    {habit.streak}🔥
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LifeCard>
  );
};

export default HabitCard;
