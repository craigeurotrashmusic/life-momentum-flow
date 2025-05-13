
import { useState } from 'react';
import { Clock, Bell, Mail, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';
import { useNudge } from '../nudge/NudgeContext';
import { TimeRangePicker } from '../nudge/TimeRangePicker';

const SettingsCard = () => {
  const { 
    nudgeFrequency,
    setNudgeFrequency,
    notificationChannels,
    toggleNotificationChannel,
    quietHours,
    setQuietHours,
    saveUserPreferences,
    userPreferences
  } = useNudge();

  const handleSaveSettings = () => {
    saveUserPreferences();
    toast.success("Settings saved successfully");
  };

  return (
    <LifeCard 
      title="Notification Settings" 
      icon={<Settings />}
      color="bg-gradient-to-br from-slate-900/30 to-zinc-900/30"
      expandable={true}
    >
      <div className="mt-2 space-y-6">
        {/* Nudge Frequency */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">Nudge Frequency</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm">Frequency: {nudgeFrequency} per hour</span>
            </div>
            <Slider
              value={[nudgeFrequency]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setNudgeFrequency(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Adjust how many nudges you receive per hour when active
            </p>
          </div>
        </div>

        {/* Notification Channels */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">Notification Channels</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span className="text-sm">In-app notifications</span>
              </div>
              <Switch 
                checked={notificationChannels.inApp}
                onCheckedChange={() => toggleNotificationChannel('inApp')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span className="text-sm">Push notifications</span>
              </div>
              <Switch 
                checked={notificationChannels.push} 
                onCheckedChange={() => toggleNotificationChannel('push')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="text-sm">Email notifications</span>
              </div>
              <Switch 
                checked={notificationChannels.email}
                onCheckedChange={() => toggleNotificationChannel('email')}
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">Quiet Hours</h3>
          <TimeRangePicker 
            startTime={quietHours.start} 
            endTime={quietHours.end}
            onChange={setQuietHours}
          />
          <p className="text-xs text-muted-foreground">
            We won't send any notifications during your quiet hours
          </p>
        </div>
        
        {/* Integration Settings */}
        <div className="space-y-3">
          <h3 className="text-base font-medium">Integrations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Calendar</span>
              <Switch checked={userPreferences.integrations?.googleCalendar} onCheckedChange={() => toggleNotificationChannel('googleCalendar')} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Google Tasks</span>
              <Switch checked={userPreferences.integrations?.googleTasks} onCheckedChange={() => toggleNotificationChannel('googleTasks')} />
            </div>
          </div>
        </div>

        <Button onClick={handleSaveSettings} className="w-full mt-4">
          Save Settings
        </Button>
      </div>
    </LifeCard>
  );
};

export default SettingsCard;
