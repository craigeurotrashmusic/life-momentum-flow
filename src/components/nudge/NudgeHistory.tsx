
import React from 'react';
import { History } from 'lucide-react';
import NudgeHistoryCard from './NudgeHistoryCard';

const NudgeHistory = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History size={18} />
        <h3 className="text-lg font-medium">Nudge History</h3>
      </div>
      <NudgeHistoryCard />
    </div>
  );
};

export default NudgeHistory;
