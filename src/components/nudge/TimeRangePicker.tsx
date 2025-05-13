
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onChange: (range: { start: string; end: string }) => void;
  enabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
}

export const TimeRangePicker = ({ 
  startTime, 
  endTime, 
  onChange,
  enabled,
  onToggleEnabled
}: TimeRangePickerProps) => {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Update parent component when times change
  useEffect(() => {
    onChange({ start, end });
  }, [start, end, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">Quiet Hours</span>
        {onToggleEnabled !== undefined && (
          <Switch 
            checked={enabled} 
            onCheckedChange={onToggleEnabled}
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">From</label>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <Select value={start} onValueChange={setStart}>
              <SelectTrigger className="h-9">
                <SelectValue>
                  {formatTimeForDisplay(start)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`start-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">To</label>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <Select value={end} onValueChange={setEnd}>
              <SelectTrigger className="h-9">
                <SelectValue>
                  {formatTimeForDisplay(end)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={`end-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
