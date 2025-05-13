
import { useState } from 'react';
import { History, Check, X, Clock, AlertCircle, Filter } from 'lucide-react';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { NudgeHistoryItem } from './types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const NudgeHistory = () => {
  const { nudgeHistory } = useNudge();
  const [filter, setFilter] = useState<'all' | 'accepted' | 'dismissed' | 'snoozed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  // Filter history based on selected filter
  const filteredHistory = filter === 'all' 
    ? nudgeHistory 
    : nudgeHistory.filter(item => item.userResponse === filter);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  
  // Get current items
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Helper to get response icon
  const getResponseIcon = (response: 'accepted' | 'dismissed' | 'snoozed') => {
    switch (response) {
      case 'accepted':
        return <Check size={14} className="text-green-500" />;
      case 'dismissed':
        return <X size={14} className="text-red-500" />;
      case 'snoozed':
        return <Clock size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };
  
  // Helper to get the count of each response type
  const getResponseCount = (type: 'accepted' | 'dismissed' | 'snoozed') => {
    return nudgeHistory.filter(item => item.userResponse === type).length;
  };
  
  // Format time difference
  const formatTimeDiff = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nudge History</h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter size={14} />
                <span className="capitalize">{filter}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by response</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('all')}>
                <div className="flex justify-between w-full">
                  <span>All</span>
                  <Badge variant="secondary" className="ml-2">{nudgeHistory.length}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('accepted')}>
                <div className="flex justify-between w-full">
                  <span>Accepted</span>
                  <Badge variant="secondary" className="ml-2">{getResponseCount('accepted')}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('dismissed')}>
                <div className="flex justify-between w-full">
                  <span>Dismissed</span>
                  <Badge variant="secondary" className="ml-2">{getResponseCount('dismissed')}</Badge>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('snoozed')}>
                <div className="flex justify-between w-full">
                  <span>Snoozed</span>
                  <Badge variant="secondary" className="ml-2">{getResponseCount('snoozed')}</Badge>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {currentItems.length === 0 ? (
        <div className="p-4 bg-secondary/30 rounded-xl flex flex-col items-center justify-center">
          <History size={24} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No history found</p>
          {filter !== 'all' && (
            <Button variant="link" size="sm" onClick={() => setFilter('all')}>
              View all history
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item: NudgeHistoryItem, index) => (
            <div key={index} className="p-3 bg-secondary/30 rounded-xl">
              <div className="flex justify-between items-start mb-1">
                <div className={`px-1.5 py-0.5 text-xs rounded capitalize ${getNudgeTypeClass(item.nudge.type)}`}>
                  {item.nudge.type}
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded">
                  {getResponseIcon(item.userResponse)}
                  <span className="text-xs capitalize">{item.userResponse}</span>
                </div>
              </div>
              
              <p className="text-sm mb-2">{item.nudge.message}</p>
              
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <AlertCircle size={12} />
                  <span>Priority {item.nudge.priority}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatTimeDiff(item.responseTime)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default NudgeHistory;
