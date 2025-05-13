
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onChange: (range: { start: string; end: string }) => void;
}

export const TimeRangePicker = ({ startTime, endTime, onChange }: TimeRangePickerProps) => {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  // Generate time options in 30-minute increments
  const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const hourFormatted = hour.toString().padStart(2, '0');
    return `${hourFormatted}:${minute}`;
  });

  useEffect(() => {
    onChange({ start, end });
  }, [start, end, onChange]);

  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-muted-foreground" />
      <div className="flex items-center gap-2 flex-1">
        <Select value={start} onValueChange={setStart}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Start Time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={`start-${time}`} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">to</span>
        <Select value={end} onValueChange={setEnd}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="End Time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={`end-${time}`} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
