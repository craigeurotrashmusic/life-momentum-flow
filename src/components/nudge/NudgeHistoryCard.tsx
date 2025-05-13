
import React, { useState } from 'react';
import { useNudge } from './NudgeContext';
import { getNudgeTypeClass } from './utils';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Filter, 
  CalendarDays,
  BellOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatTime } from './utils';

const NudgeHistoryCard = () => {
  const { nudgeHistory } = useNudge();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'dismissed' | 'snoozed'>('all');
  const itemsPerPage = 5;

  // Filter history based on selected filter
  const filteredHistory = filter === 'all' 
    ? nudgeHistory 
    : nudgeHistory.filter(item => item.userResponse === filter);
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value as 'all' | 'accepted' | 'dismissed' | 'snoozed');
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const renderResponseIcon = (response: 'accepted' | 'dismissed' | 'snoozed') => {
    switch (response) {
      case 'accepted':
        return <ThumbsUp size={14} className="text-green-500" />;
      case 'dismissed':
        return <ThumbsDown size={14} className="text-red-500" />;
      case 'snoozed':
        return <BellOff size={14} className="text-amber-500" />;
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageItems = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      pageItems.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at edges
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Show ellipsis if needed
      if (startPage > 2) {
        pageItems.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show ellipsis if needed
      if (endPage < totalPages - 1) {
        pageItems.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Always show last page
      pageItems.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        {pageItems}
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Nudge History</CardTitle>
            <CardDescription>Your past interactions with nudges</CardDescription>
          </div>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <Filter size={14} />
                <span>Filter by</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
              <SelectItem value="snoozed">Snoozed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {paginatedHistory.length > 0 ? (
          <div className="space-y-3">
            {paginatedHistory.map((item, index) => (
              <div 
                key={`${item.nudge.id}-${index}`} 
                className="p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge className={getNudgeTypeClass(item.nudge.type)}>
                      {item.nudge.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {renderResponseIcon(item.userResponse)}
                      <span className="ml-1 capitalize">{item.userResponse}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays size={12} />
                    <span>{formatDate(item.responseTime)}</span>
                  </div>
                </div>
                <p className="text-sm mt-2">{item.nudge.message}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatTime(item.responseTime)}</span>
                  </div>
                  {item.timeToRespond && (
                    <span>Response time: {Math.round(item.timeToRespond / 1000)}s</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <p>No nudge history available{filter !== 'all' ? ` for "${filter}" responses` : ''}.</p>
          </div>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter>
          <div className="w-full">
            <Pagination>
              {renderPagination()}
            </Pagination>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default NudgeHistoryCard;
