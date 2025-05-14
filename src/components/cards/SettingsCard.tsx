import React, { useState } from 'react';
import { useNudge } from '../nudge/NudgeContext';
import { UserPreferences, NotificationChannel, QuietHours } from '../nudge/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/sonner';
import { TimeRangePicker } from '../nudge/TimeRangePicker';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-4 border-b border-border/50 last:border-b-0">
    <h3 className="text-lg font-semibold mb-3 text-foreground">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const channelLabels: Record<NotificationChannel, string> = {
  inApp: "In-App Alerts",
  push: "Push Notifications",
  email: "Email Summaries",
  googleCalendar: "Google Calendar Integration",
  googleTasks: "Google Tasks Integration",
};

const SettingsCard = () => {
  const {
    userPreferences,
    setNudgeFrequency,
    toggleNotificationChannel,
    setQuietHours,
    saveUserPreferences,
    isLoadingPreferences,
  } = useNudge();

  // Default user preferences to ensure structure if parts are missing
  const defaultUserPreferences: UserPreferences = {
    userId: undefined,
    nudgeFrequency: 3,
    notificationChannels: {
      inApp: true,
      push: true,
      email: false,
      googleCalendar: false,
      googleTasks: false,
    },
    quietHours: {
      start: "22:00",
      end: "07:00",
      enabled: true
    },
    integrations: {
      googleCalendar: false,
      googleTasks: false
    },
    isLoading: false,
  };

  // Local state for unsaved changes, initialized from context
  // This helps manage edits before saving
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(userPreferences);

  // Update local state when context changes (e.g., after fetching)
  React.useEffect(() => {
    // Ensure localPreferences are deeply merged to avoid losing nested object structures
    setLocalPreferences(prevLocal => ({
        ...defaultUserPreferences, // Base defaults
        ...userPreferences, // Context preferences
        ...prevLocal, // Current local edits (if any, to not override unsaved changes by context update directly)
        // Explicitly merge nested objects from userPreferences to ensure they are up-to-date
        notificationChannels: {
            ...defaultUserPreferences.notificationChannels,
            ...(userPreferences.notificationChannels || {}),
            ...(prevLocal.notificationChannels || {}),
        },
        quietHours: {
            ...defaultUserPreferences.quietHours,
            ...(userPreferences.quietHours || {}),
            ...(prevLocal.quietHours || {}),
        },
        integrations: {
            ...defaultUserPreferences.integrations,
            ...(userPreferences.integrations || {}),
            ...(prevLocal.integrations || {}),
        },
    }));
  }, [userPreferences]);

  const handleFrequencyChange = (value: number[]) => {
    setLocalPreferences(prev => ({ ...prev, nudgeFrequency: value[0] }));
  };

  const handleChannelToggle = (channel: NotificationChannel) => {
    setLocalPreferences(prev => {
      const currentChannels = prev.notificationChannels || {
        inApp: false,
        push: false,
        email: false,
        googleCalendar: false,
        googleTasks: false,
      };
      const currentIntegrations = prev.integrations || { googleCalendar: false, googleTasks: false };
      
      if (channel === 'googleCalendar' || channel === 'googleTasks') {
        return {
          ...prev,
          integrations: {
            ...currentIntegrations,
            [channel]: !currentIntegrations[channel]
          }
        };
      }
      return {
        ...prev,
        notificationChannels: {
          ...currentChannels, 
          [channel]: !currentChannels[channel]
        }
      };
    });
  };

  const handleQuietHoursChange = (part: 'start' | 'end' | 'enabled', value: string | boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      quietHours: {
        ...(prev.quietHours || { start: "22:00", end: "07:00", enabled: false }),
        [part]: value,
      }
    }));
  };
  
  const handleTimeRangeChange = (start: string, end: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      quietHours: { 
        ...(prev.quietHours || { start: "22:00", end: "07:00", enabled: false }),
        start, 
        end 
      }
    }));
  };

  const handleSave = async () => {
    // Apply local changes to context
    setNudgeFrequency(localPreferences.nudgeFrequency);
    
    // Ensure notificationChannels and integrations are not undefined before iterating
    const prefChannels = localPreferences.notificationChannels || defaultUserPreferences.notificationChannels;
    const userPrefChannels = userPreferences.notificationChannels || defaultUserPreferences.notificationChannels;
    (Object.keys(prefChannels) as NotificationChannel[]).forEach(key => {
        if (prefChannels[key] !== userPrefChannels[key]) {
            toggleNotificationChannel(key);
        }
    });

    const prefIntegrations = localPreferences.integrations || defaultUserPreferences.integrations;
    const userPrefIntegrations = userPreferences.integrations || defaultUserPreferences.integrations;
    (Object.keys(prefIntegrations) as Extract<NotificationChannel, 'googleCalendar' | 'googleTasks'>[]).forEach(key => {
        if (prefIntegrations[key] !== userPrefIntegrations[key]) {
            toggleNotificationChannel(key); // toggleNotificationChannel handles both types
        }
    });
    setQuietHours(localPreferences.quietHours || defaultUserPreferences.quietHours);
    
    await saveUserPreferences();
  };

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-lg border border-border/20">
      <h2 className="text-xl font-bold mb-6 text-foreground">Nudge Settings</h2>

      <SettingsSection title="Nudge Frequency">
        <p className="text-sm text-muted-foreground mb-2">
          Adjust how often you receive nudges. Current: {localPreferences.nudgeFrequency} (Lower is less frequent)
        </p>
        <Slider
          defaultValue={[localPreferences?.nudgeFrequency ?? defaultUserPreferences.nudgeFrequency]}
          min={1}
          max={5}
          step={1}
          onValueChange={handleFrequencyChange}
          disabled={isLoadingPreferences}
          aria-label="Nudge frequency"
        />
      </SettingsSection>

      <SettingsSection title="Notification Channels">
        {(Object.keys(channelLabels) as NotificationChannel[]).map((channel) => (
          <div key={channel} className="flex items-center justify-between">
            <Label htmlFor={String(channel)} className="text-sm text-foreground">{channelLabels[channel]}</Label>
            <Switch
              id={String(channel)}
              checked={
                (channel === 'googleCalendar' || channel === 'googleTasks') 
                ? !!localPreferences.integrations?.[channel] 
                : !!localPreferences.notificationChannels?.[channel]
              }
              onCheckedChange={() => handleChannelToggle(channel)}
              disabled={isLoadingPreferences}
            />
          </div>
        ))}
      </SettingsSection>

      <SettingsSection title="Quiet Hours">
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="quiet-hours-enabled" className="text-sm text-foreground">Enable Quiet Hours</Label>
          <Switch
            id="quiet-hours-enabled"
            checked={!!localPreferences.quietHours?.enabled}
            onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
            disabled={isLoadingPreferences}
          />
        </div>
        {localPreferences.quietHours?.enabled && (
           <TimeRangePicker
            startTime={localPreferences.quietHours.start}
            endTime={localPreferences.quietHours.end}
            onChange={({start, end}) => handleTimeRangeChange(start, end)}
          />
        )}
      </SettingsSection>
      
      <Button 
        onClick={handleSave} 
        className="w-full mt-6"
        disabled={isLoadingPreferences}
      >
        {isLoadingPreferences ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
};

export default SettingsCard;
