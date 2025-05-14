
import { useState } from 'react';
import { Clock, Bell, Mail, Settings, CheckCircle, ExternalLink } from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
// Select component not used in the provided snippet, if it were, ensure consistency.
import { toast } from '@/components/ui/sonner';
import LifeCard from './LifeCard';
import { useNudge } from '../nudge/NudgeContext';
import { TimeRangePicker } from '../nudge/TimeRangePicker'; // Assuming this is styled consistently

const SettingsCard = () => {
  const { 
    nudgeFrequency,
    setNudgeFrequency,
    notificationChannels,
    toggleNotificationChannel,
    quietHours,
    setQuietHours,
    saveUserPreferences,
    userPreferences, // Assuming integrations are part of this
    isLoadingPreferences, // Added for loading state
  } = useNudge();

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveUserPreferences();
      toast.success("Settings saved successfully", { icon: <CheckCircle className="text-green-500" /> });
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper for integration toggles if userPreferences.integrations is potentially undefined
  const handleIntegrationToggle = (key: keyof NonNullable<UserPreferences['integrations']>) => {
    // This assumes toggleNotificationChannel can handle these keys or a new function is made
    // For this example, I'll use a placeholder logic.
    // In a real scenario, you'd update userPreferences state and then save.
    console.log(`Toggling integration: ${key}`);
    // This part would need a proper state update mechanism for integrations
    // e.g., setUserPreferences(prev => ({...prev, integrations: {...prev.integrations, [key]: !prev.integrations?.[key]}}))
    // For now, this just calls the existing toggle function which might not be ideal for integrations.
    // toggleNotificationChannel(key as any); // Casting as any for placeholder, needs proper handling
     toast.info("Integration toggle needs specific backend logic not yet implemented in NudgeContext.");
  };


  return (
    // Using defaultExpanded to have settings initially open
    <LifeCard 
      title="Notification & Nudge Settings" 
      icon={<Settings className="text-primary"/>} // Ensure icon color is consistent
      color="bg-gradient-to-br from-slate-800/50 to-zinc-800/50" // Slightly adjusted gradient for settings
      expandable={true}
      defaultExpanded={true} // Settings card often useful to see by default
    >
      {isLoadingPreferences ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-muted-foreground">Loading preferences...</p>
        </div>
      ) : (
        <div className="mt-2 space-y-6 p-2"> {/* Added small padding inside card content area */}
          {/* Nudge Frequency */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
            <h3 className="text-md font-medium text-foreground">Nudge Frequency</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Frequency:</span>
                <span className="text-sm font-semibold text-primary">{nudgeFrequency} per hour</span>
              </div>
              <Slider
                value={[nudgeFrequency]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setNudgeFrequency(value[0])}
                aria-label="Nudge frequency per hour"
              />
              <p className="text-xs text-muted-foreground/80">
                Adjust how many nudges you receive per hour when active.
              </p>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
            <h3 className="text-md font-medium text-foreground">Notification Channels</h3>
            <div className="space-y-4">
              {(Object.keys(notificationChannels) as Array<keyof typeof notificationChannels>).map((channelKey) => {
                // Assuming 'inApp', 'push', 'email' are the keys
                if (channelKey === 'googleCalendar' || channelKey === 'googleTasks') return null; // Skip integrations here

                const channelName = {
                  inApp: "In-app notifications",
                  push: "Push notifications",
                  email: "Email notifications",
                }[channelKey] || channelKey;
                
                const IconComponent = channelKey === 'email' ? Mail : Bell;

                return (
                  <div key={channelKey} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{channelName}</span>
                    </div>
                    <Switch 
                      checked={notificationChannels[channelKey]?.enabled} // Check for enabled property
                      onCheckedChange={() => toggleNotificationChannel(channelKey)}
                      aria-label={`Toggle ${channelName}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Integrations: Assuming these are boolean flags in userPreferences.integrations */}
          {userPreferences?.integrations && (
            <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
              <h3 className="text-md font-medium text-foreground">Integrations</h3>
              <div className="space-y-4">
                {Object.entries(userPreferences.integrations).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Generic icon for now, could map specific icons */}
                      <ExternalLink size={18} className="text-muted-foreground" /> 
                      <span className="text-sm text-muted-foreground">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                    <Switch
                      checked={!!value} // Ensure it's a boolean for the switch
                      onCheckedChange={() => handleIntegrationToggle(key as keyof UserPreferences['integrations'])}
                      aria-label={`Toggle ${key} integration`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Quiet Hours */}
          <div className="space-y-3 p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-muted-foreground" />
                <h3 className="text-md font-medium text-foreground">Quiet Hours</h3>
            </div>
            <TimeRangePicker 
              startTime={quietHours.start} 
              endTime={quietHours.end}
              onChange={setQuietHours}
            />
            <p className="text-xs text-muted-foreground/80">
              Notifications will be silenced during these hours.
            </p>
          </div>
          
          <Button onClick={handleSaveSettings} className="w-full mt-4 py-3 text-base" disabled={isSaving || isLoadingPreferences}>
            {isSaving ? "Saving..." : (isLoadingPreferences ? "Loading..." : "Save All Settings")}
          </Button>
        </div>
      )}
    </LifeCard>
  );
};

export default SettingsCard;
