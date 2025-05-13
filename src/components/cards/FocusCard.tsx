
import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckCircle, BarChart, Bell, Clock8 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend 
} from 'recharts';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';

// Types for session data
interface FocusSession {
  id: string;
  date: Date;
  duration: number; // in seconds
  completed: boolean;
  flowStateAchieved: boolean;
  interruptions: number;
}

const FocusCard = () => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [flowStateDetected, setFlowStateDetected] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  
  // Default duration options in minutes
  const durationOptions = [5, 15, 25, 45, 60];
  const [selectedDuration, setSelectedDuration] = useState(25);
  
  // Mock weekly focus data for analytics
  const weeklyFocusData = [
    { name: 'Mon', sessions: 3, duration: 85, flow: 40 },
    { name: 'Tue', sessions: 4, duration: 120, flow: 70 },
    { name: 'Wed', sessions: 2, duration: 60, flow: 45 },
    { name: 'Thu', sessions: 5, duration: 150, flow: 100 },
    { name: 'Fri', sessions: 3, duration: 90, flow: 60 },
    { name: 'Sat', sessions: 1, duration: 25, flow: 15 },
    { name: 'Sun', sessions: 2, duration: 50, flow: 30 },
  ];
  
  // Function to detect flow state (simplified for demo)
  useEffect(() => {
    if (isActive && time < (selectedDuration * 60 - 300) && time > 300 && !flowStateDetected) {
      // Flow state detected after 5 minutes without interruptions
      if (interruptions === 0) {
        setFlowStateDetected(true);
        toast.success('Flow state detected! Keep going!', {
          position: 'top-center',
        });
      }
    }
  }, [time, isActive, interruptions, flowStateDetected, selectedDuration]);
  
  // Reset everything when duration changes
  useEffect(() => {
    resetTimer();
  }, [selectedDuration]);
  
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    const id = window.setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsActive(false);
          completeSession();
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
    setIsPaused(true);
    setInterruptions(prev => prev + 1);
  };
  
  const resumeTimer = () => {
    setIsPaused(false);
    const id = window.setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsActive(false);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };
  
  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsActive(false);
    setIsPaused(false);
    setTime(selectedDuration * 60);
    setFlowStateDetected(false);
    setInterruptions(0);
  };
  
  const completeSession = () => {
    const duration = selectedDuration * 60 - time;
    setTotalFocusTime(prev => prev + duration);
    setSessionCount(prev => prev + 1);
    
    // Create new session record
    const newSession = {
      id: Date.now().toString(),
      date: new Date(),
      duration,
      completed: true,
      flowStateAchieved: flowStateDetected,
      interruptions
    };
    
    setSessions(prev => [...prev, newSession]);
    
    // Send reinforcement and celebration
    toast.success(`Focus session completed! Total: ${sessionCount + 1}`, {
      position: 'top-center',
      duration: 5000,
    });
    
    resetTimer();
    
    // If flow state achieved, give extra reinforcement
    if (flowStateDetected) {
      setTimeout(() => {
        toast("Flow milestone achieved!", {
          description: "You've unlocked a new flow badge!",
          position: 'top-center',
          icon: <CheckCircle className="text-green-500" />,
        });
      }, 1500);
    }
  };
  
  const changeDuration = (mins: number) => {
    if (!isActive) {
      setSelectedDuration(mins);
      setTime(mins * 60);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = 100 - (time / (selectedDuration * 60) * 100);

  return (
    <LifeCard 
      title="Focus Mode" 
      icon={<Clock />}
      color="bg-gradient-to-br from-blue-900/30 to-teal-900/30"
      expandable={true}
    >
      <div className="flex flex-col items-center justify-center mt-4">
        <div className="text-5xl font-bold mb-2">{formatTime(time)}</div>
        
        <div className="w-full mb-6">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {flowStateDetected && isActive && (
          <div className="mb-4 px-3 py-1.5 bg-green-500/20 text-green-500 rounded-full flex items-center">
            <CheckCircle size={16} className="mr-2" />
            <span className="text-sm font-medium">Flow state detected</span>
          </div>
        )}
        
        <div className="flex gap-2 mb-6">
          {durationOptions.map(duration => (
            <Button
              key={duration}
              onClick={() => changeDuration(duration)}
              className={`px-3 py-1 h-auto ${selectedDuration === duration ? 'bg-primary' : 'bg-secondary/50'}`}
              disabled={isActive}
              variant={selectedDuration === duration ? "default" : "outline"}
              size="sm"
            >
              {duration}m
            </Button>
          ))}
        </div>
        
        <div className="flex gap-4">
          {!isActive ? (
            <Button 
              onClick={startTimer} 
              className="rounded-full px-6"
              variant="default"
            >
              <Play size={18} className="mr-2" /> Start Focus
            </Button>
          ) : isPaused ? (
            <Button 
              onClick={resumeTimer} 
              className="rounded-full px-6"
              variant="default"
            >
              <Play size={18} className="mr-2" /> Resume
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
            disabled={!isActive && !isPaused}
          >
            <RotateCcw size={18} />
          </Button>
        </div>
        
        <div className="mt-8 w-full">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Today's sessions</p>
              <p className="text-xl font-bold">{sessionCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total focus time</p>
              <p className="text-xl font-bold">{Math.floor(totalFocusTime / 60)}m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Flow states</p>
              <p className="text-xl font-bold">{sessions.filter(s => s.flowStateAchieved).length}</p>
            </div>
          </div>
          
          <Button 
            className="w-full py-3 mt-2 rounded-xl flex items-center justify-center gap-2"
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
          >
            <BarChart size={16} />
            <span>View Focus Analytics</span>
          </Button>
        </div>
      </div>
      
      {/* Focus Analytics Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[90%] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Focus Analytics</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Weekly Performance</h3>
            
            <div className="h-[300px] mb-8">
              <ChartContainer
                className="h-full"
                config={{
                  sessions: { color: "#4ade80" },
                  duration: { color: "#60a5fa" },
                  flow: { color: "#a78bfa" },
                }}
              >
                <RechartsBarChart
                  data={weeklyFocusData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="sessions" name="Number of Sessions" fill="#4ade80" />
                  <Bar dataKey="duration" name="Focus Minutes" fill="#60a5fa" />
                  <Bar dataKey="flow" name="Flow Minutes" fill="#a78bfa" />
                </RechartsBarChart>
              </ChartContainer>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Recent Sessions</h3>
            <div className="space-y-3 mb-6">
              {sessions.length > 0 ? (
                sessions.slice(-5).reverse().map((session) => (
                  <div key={session.id} className="p-3 bg-secondary/30 rounded-xl flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <Clock8 size={16} className="mr-2" />
                        <span className="font-medium">
                          {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(session.duration / 60)} minutes
                        {session.flowStateAchieved && " · Flow achieved!"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{session.interruptions} pauses</div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No sessions recorded yet</p>
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-3">Focus Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-xl">
                <h4 className="font-medium mb-1">Peak Performance Times</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your session data, your peak focus hours appear to be in the morning between 9-11am.
                </p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl">
                <h4 className="font-medium mb-1">Focus Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  Try scheduling deep work tasks during your peak focus hours and use 25-minute sessions for optimal productivity.
                </p>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6"
              variant="default"
              onClick={() => setIsDialogOpen(false)}
            >
              Close Analytics
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default FocusCard;
