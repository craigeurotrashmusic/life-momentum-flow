
import { 
  ChartContainer, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { BarChart, Clock8 } from 'lucide-react';
import { FocusSession } from './types';

interface FocusAnalyticsProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  sessions: FocusSession[];
  weeklyFocusData: any[];
}

const FocusAnalytics = ({ 
  isDialogOpen, 
  setIsDialogOpen, 
  sessions, 
  weeklyFocusData 
}: FocusAnalyticsProps) => {
  return (
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
  );
};

export default FocusAnalytics;
