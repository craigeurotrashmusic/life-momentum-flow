
import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw, CheckCircle, BarChart, Send, Star, ThumbsUp, ThumbsDown, CalendarClock, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner'; // Using sonner for toasts
import LifeCard from '@/components/cards/LifeCard'; // Assuming LifeCard is in cards, adjust if moved
import { useAuth } from '@/hooks/useAuth';
import {
  createFocusSession,
  updateFocusSession,
  fetchRecentSessions,
  subscribeToFocusSessionsChanges,
  FocusSession,
  FocusSessionInsert,
} from '@/lib/api/focus';
import { RealtimeChannel } from '@supabase/supabase-js';

// Default duration options in minutes
const DURATION_OPTIONS = [15, 25, 45]; // Custom will be handled by an input

// Phases for timer visualization (simplified)
const FOCUS_PHASES = {
  WARM_UP: { color: 'bg-blue-500', label: 'Warm Up' },
  DEEP_FOCUS: { color: 'bg-teal-500', label: 'Deep Focus' },
  COOL_DOWN: { color: 'bg-purple-500', label: 'Cool Down' },
};

const FocusCard = () => {
  const { user } = useAuth();

  // Session State
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [goalText, setGoalText] = useState('');
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState(25); // Default 25 mins
  const [customDurationMinutes, setCustomDurationMinutes] = useState<number | undefined>();

  // Timer State
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(selectedDurationMinutes * 60); // in seconds
  const [timerIntervalId, setTimerIntervalId] = useState<number | null>(null);

  // Reflection State
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [reflectionCompletedGoal, setReflectionCompletedGoal] = useState<boolean | null>(null);
  const [reflectionFocusRating, setReflectionFocusRating] = useState<number | null>(null);
  
  // Analytics & Recommendations State
  const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);
  const [peakFocusTime, setPeakFocusTime] = useState<string | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);

  const totalSessionDuration = currentSession?.duration || selectedDurationMinutes * 60;

  // Fetch initial data
  useEffect(() => {
    if (user?.id) {
      fetchRecentSessions(user.id, 5).then(({ data }) => {
        if (data) {
          setRecentSessions(data);
          // Basic streak/peak calculation (can be moved to context)
          calculateAnalytics(data);
        }
      });

      const channel: RealtimeChannel = subscribeToFocusSessionsChanges(user.id, (payload) => {
        console.log('Focus session change:', payload);
        fetchRecentSessions(user.id, 5).then(({ data: updatedData }) => {
          if (updatedData) {
            setRecentSessions(updatedData);
            calculateAnalytics(updatedData);
          }
        });
      });
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const calculateAnalytics = (sessions: FocusSession[]) => {
    // Simplified streak: count consecutive days with completed sessions
    let streak = 0;
    if (sessions.length > 0) {
      // This is a very basic streak logic, needs improvement for actual day checking
      streak = sessions.filter(s => s.completed).length; 
    }
    setFocusStreak(streak);

    // Simplified peak focus time: most common hour for completed sessions
    const hourCounts: Record<string, number> = {};
    sessions.filter(s => s.completed && s.start_time).forEach(s => {
      const hour = new Date(s.start_time!).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    let maxCount = 0;
    let peakHour: string | null = null;
    for (const hour in hourCounts) {
      if (hourCounts[hour] > maxCount) {
        maxCount = hourCounts[hour];
        peakHour = `${hour}:00 - ${parseInt(hour)+1}:00`;
      }
    }
    setPeakFocusTime(peakHour);
  };

  const handleDurationChange = (mins: number | 'custom') => {
    if (isActive) return;
    if (mins === 'custom') {
      // Allow user to input custom duration, handled by customDurationMinutes state
      // For simplicity, let's assume custom input sets selectedDurationMinutes via another UI element later
    } else {
      setSelectedDurationMinutes(mins);
      setTimeRemaining(mins * 60);
      setCustomDurationMinutes(undefined);
    }
  };

  const effectiveDurationMinutes = customDurationMinutes || selectedDurationMinutes;
  
  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(effectiveDurationMinutes * 60);
    }
  }, [effectiveDurationMinutes, isActive]);


  const startTimer = async () => {
    if (!user?.id || !goalText.trim()) {
      toast.error('Please set a goal for your focus session.');
      return;
    }
    setIsLoading(true);
    const sessionToCreate: FocusSessionInsert = {
      user_id: user.id,
      goal_text: goalText,
      duration: effectiveDurationMinutes * 60,
      start_time: new Date().toISOString(),
      interruptions: 0,
      flow_state_achieved: false, // To be updated during session
      completed: false,
    };

    const { data: newSession, error } = await createFocusSession(sessionToCreate);
    setIsLoading(false);

    if (error || !newSession) {
      toast.error('Failed to start session. Please try again.');
      return;
    }

    setCurrentSession(newSession);
    setIsActive(true);
    setIsPaused(false);
    setTimeRemaining(newSession.duration); // Start with full duration from DB

    const id = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsActive(false);
          completeSession(newSession, true); // Mark as completed by timer finish
          return 0;
        }
        // Midpoint nudge
        if (newSession.duration && prev === Math.floor(newSession.duration / 2)) {
            toast.info("Halfway there! How's your focus?", { position: "top-center" });
        }
        return prev - 1;
      });
    }, 1000);
    setTimerIntervalId(id);
    toast.success('Focus session started!');
  };

  const pauseTimer = () => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    setIsPaused(true);
    if (currentSession) {
      const newInterruptions = (currentSession.interruptions || 0) + 1;
      setCurrentSession(prev => prev ? {...prev, interruptions: newInterruptions } : null);
      // Debounce update to Supabase or update on resume/finish
      updateFocusSession(currentSession.id, { interruptions: newInterruptions });
    }
    toast.info('Session paused.');
  };

  const resumeTimer = () => {
    setIsPaused(false);
    if (!currentSession) return; // Should not happen if paused

    const id = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setIsActive(false);
          completeSession(currentSession, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerIntervalId(id);
    toast.success('Session resumed.');
  };

  const resetTimer = (promptReflection = false) => {
    if (timerIntervalId) clearInterval(timerIntervalId);
    setTimerIntervalId(null);
    
    if (isActive && currentSession && promptReflection) {
      // If timer is reset while active, consider it incomplete but still prompt for reflection
      completeSession(currentSession, false);
    } else {
      setIsActive(false);
      setIsPaused(false);
      setTimeRemaining(effectiveDurationMinutes * 60);
      setGoalText(''); // Reset goal on manual reset
      setCurrentSession(null);
    }
  };

  const completeSession = (session: FocusSession, wasCompletedByTimer: boolean) => {
    setShowReflectionDialog(true); // Prompt for reflection
    // Actual completion (rating, etc.) will be handled after reflection dialog
    // For now, just clear active state
    setIsActive(false);
    setIsPaused(false);

    // Micro-reward (simplified)
    toast.success('Session ended! Time to reflect.', {
        icon: <CheckCircle className="text-green-500" />,
        duration: 4000,
    });
    // TODO: Add confetti/sound later
  };

  const handleReflectionSubmit = async () => {
    if (!currentSession || reflectionFocusRating === null || reflectionCompletedGoal === null) {
      toast.error("Please complete the reflection.");
      return;
    }
    setIsLoading(true);
    const updates: Partial<FocusSessionInsert> = {
      end_time: new Date().toISOString(),
      completed: reflectionCompletedGoal, 
      focus_rating: reflectionFocusRating,
      // flow_state_achieved can be updated here if detected
    };
    const { data: updatedSession, error } = await updateFocusSession(currentSession.id, updates);
    setIsLoading(false);
    setShowReflectionDialog(false);

    if (error || !updatedSession) {
      toast.error('Failed to save reflection. Please try again.');
    } else {
      toast.success('Reflection saved! Great work.', { icon: <ThumbsUp /> });
      setCurrentSession(updatedSession); // Update local state with final data
      // Fetch fresh data after reflection
       if (user?.id) {
        fetchRecentSessions(user.id, 5).then(({ data }) => {
          if (data) {
            setRecentSessions(data);
            calculateAnalytics(data);
          }
        });
      }
    }
    // Reset for next session
    setTimeRemaining(effectiveDurationMinutes * 60);
    setGoalText('');
    setReflectionCompletedGoal(null);
    setReflectionFocusRating(null);
    // currentSession will be cleared by next start or can be cleared here if desired
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercentage = currentSession?.duration
    ? 100 - (timeRemaining / currentSession.duration) * 100
    : 100 - (timeRemaining / (effectiveDurationMinutes * 60)) * 100;

  const getTimerPhase = () => {
    if (!isActive || !currentSession?.duration) return FOCUS_PHASES.WARM_UP;
    const elapsed = currentSession.duration - timeRemaining;
    const third = currentSession.duration / 3;
    if (elapsed < third) return FOCUS_PHASES.WARM_UP;
    if (elapsed < 2 * third) return FOCUS_PHASES.DEEP_FOCUS;
    return FOCUS_PHASES.COOL_DOWN;
  };
  const currentPhase = getTimerPhase();


  return (
    <LifeCard
      title="Focus Mode"
      icon={<Brain />} // Updated Icon
      color="bg-gradient-to-br from-blue-900/30 to-teal-900/30"
      expandable={true} // Can be set to false if content is always visible
    >
      <div className="flex flex-col items-center mt-4 space-y-6">
        {!isActive && !currentSession && ( // Pre-commitment view
          <>
            <div className="w-full space-y-2">
              <Label htmlFor="focus-goal">What's your goal for this session?</Label>
              <Textarea
                id="focus-goal"
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="e.g., Draft project proposal outline"
                rows={2}
                className="bg-background/50"
              />
            </div>
            <div className="w-full space-y-2">
              <Label>Select duration (minutes):</Label>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map(duration => (
                  <Button
                    key={duration}
                    onClick={() => handleDurationChange(duration)}
                    variant={effectiveDurationMinutes === duration && !customDurationMinutes ? 'default' : 'outline'}
                    size="sm"
                    className="flex-grow"
                    disabled={isActive}
                  >
                    {duration}m
                  </Button>
                ))}
                {/* Basic custom duration input, can be improved */}
                <Input
                    type="number"
                    placeholder="Custom"
                    value={customDurationMinutes || ''}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                            setCustomDurationMinutes(val);
                            setSelectedDurationMinutes(val); // Also set as selected
                        } else if (e.target.value === '') {
                            setCustomDurationMinutes(undefined);
                            setSelectedDurationMinutes(DURATION_OPTIONS[1]); // Revert to default if cleared
                        }
                    }}
                    className="w-24 bg-background/50"
                    disabled={isActive}
                />
              </div>
            </div>
          </>
        )}

        {(isActive || currentSession) && ( // Timer view
          <>
            <div className="text-6xl font-bold font-mono tracking-tighter text-center">
              {formatTime(timeRemaining)}
            </div>
            <div className="w-full">
              <Progress value={progressPercentage} className="h-3" indicatorClassName={currentPhase.color} />
              <p className="text-xs text-center mt-1 text-muted-foreground">{currentPhase.label}</p>
            </div>
            {currentSession?.goal_text && (
              <p className="text-sm text-center italic text-muted-foreground px-4">
                Focusing on: "{currentSession.goal_text}"
              </p>
            )}
          </>
        )}
        
        {/* Controls */}
        <div className="flex gap-3">
          {!isActive ? (
            <Button
              onClick={startTimer}
              className="px-6 py-3 text-lg rounded-xl"
              disabled={isLoading || !goalText.trim()}
              size="lg"
            >
              <Play size={20} className="mr-2" /> Start Focus
            </Button>
          ) : isPaused ? (
            <Button onClick={resumeTimer} className="px-6 py-3 text-lg rounded-xl" size="lg">
              <Play size={20} className="mr-2" /> Resume
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="px-6 py-3 text-lg rounded-xl" size="lg">
              <Pause size={20} className="mr-2" /> Pause
            </Button>
          )}
          <Button
            onClick={() => resetTimer(true)} // Prompt reflection if reset while active
            variant="ghost"
            size="lg"
            className="px-6 py-3 text-lg rounded-xl"
            disabled={(!isActive && !currentSession) || isLoading}
          >
            <RotateCcw size={20} />
          </Button>
        </div>

        {/* Basic Analytics Display */}
        {recentSessions.length > 0 && !isActive && (
          <div className="mt-6 w-full border-t pt-6 space-y-3">
            <h3 className="text-md font-semibold text-center mb-2">Your Focus Snapshot</h3>
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold">{focusStreak}</p>
                <p className="text-xs text-muted-foreground">Session Streak</p>
              </div>
              <div>
                <p className="text-lg font-bold">{peakFocusTime || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Peak Time</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Recommendation: Try a {effectiveDurationMinutes} min session {peakFocusTime ? `around ${peakFocusTime}` : "when you feel most alert"}.
            </p>
          </div>
        )}

      </div>

      {/* Reflection Dialog */}
      <Dialog open={showReflectionDialog} onOpenChange={(isOpen) => {
        if (!isOpen && currentSession && !currentSession.completed && !currentSession.focus_rating) {
          // If dialog is closed without submitting, and session isn't fully saved, consider it.
          // For now, just close. Might need to auto-save with defaults or prompt again.
        }
        setShowReflectionDialog(isOpen);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Reflection</DialogTitle>
            <DialogDescription>
              How did your focus session on "{currentSession?.goal_text}" go?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Did you complete your goal?</Label>
              <div className="flex gap-2 mt-1">
                <Button 
                    variant={reflectionCompletedGoal === true ? "default" : "outline"} 
                    onClick={() => setReflectionCompletedGoal(true)}
                    className="flex-grow"
                >
                    <ThumbsUp className="mr-2 h-4 w-4" /> Yes
                </Button>
                <Button 
                    variant={reflectionCompletedGoal === false ? "default" : "outline"} 
                    onClick={() => setReflectionCompletedGoal(false)}
                    className="flex-grow"
                >
                    <ThumbsDown className="mr-2 h-4 w-4" /> No
                </Button>
              </div>
            </div>
            <div>
              <Label>Rate your focus (1-5 stars):</Label>
              <div className="flex justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => setReflectionFocusRating(star)}
                  >
                    <Star className={cn("h-6 w-6", (reflectionFocusRating || 0) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground")} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleReflectionSubmit} disabled={isLoading || reflectionFocusRating === null || reflectionCompletedGoal === null}>
              {isLoading ? "Saving..." : "Save Reflection"} <Send className="ml-2 h-4 w-4"/>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LifeCard>
  );
};

export default FocusCard;

