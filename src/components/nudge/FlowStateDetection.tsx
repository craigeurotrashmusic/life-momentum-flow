
const FlowStateDetection = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Flow-State Detection</h3>
      <div className="p-3 bg-secondary/30 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Today's flow periods</div>
          <div className="text-sm font-medium">2 detected</div>
        </div>
        <div className="relative h-4 bg-secondary/30 rounded-full mb-1 overflow-hidden">
          <div className="absolute top-0 left-[10%] w-[15%] h-full bg-blue-500/70 rounded-full" />
          <div className="absolute top-0 left-[65%] w-[20%] h-full bg-blue-500/70 rounded-full" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8 AM</span>
          <span>12 PM</span>
          <span>4 PM</span>
          <span>8 PM</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Your optimal flow periods occur mid-morning and late afternoon
      </p>
    </div>
  );
};

export default FlowStateDetection;
