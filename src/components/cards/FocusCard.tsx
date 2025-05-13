
import { useState } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LifeCard from './LifeCard';

const FocusCard = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [intervalId, setIntervalId] = useState<number | null>(null);
  
  const startTimer = () => {
    setIsActive(true);
    const id = window.setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };
  
  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
  };
  
  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
    setTime(25 * 60);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LifeCard 
      title="Focus Mode" 
      icon={<Clock />}
      color="bg-gradient-to-br from-blue-900/30 to-teal-900/30"
    >
      <div className="flex flex-col items-center justify-center mt-4">
        <div className="text-5xl font-bold mb-6">{formatTime(time)}</div>
        
        <div className="flex gap-4">
          {!isActive ? (
            <Button 
              onClick={startTimer} 
              className="rounded-full px-6"
              variant="default"
            >
              <Play size={18} className="mr-2" /> Start Focus
            </Button>
          ) : (
            <Button 
              onClick={pauseTimer} 
              className="rounded-full px-6"
              variant="outline"
            >
              <Pause size={18} className="mr-2" /> Pause
            </Button>
          )}
          
          <Button 
            onClick={resetTimer} 
            className="rounded-full"
            variant="ghost"
            size="icon"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>
    </LifeCard>
  );
};

export default FocusCard;
