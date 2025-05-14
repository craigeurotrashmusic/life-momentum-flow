
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LifeCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  color?: string;
  expandable?: boolean;
  defaultExpanded?: boolean; // New prop
}

const LifeCard = ({
  title,
  icon,
  children,
  color = "bg-gradient-to-br from-primary/20 to-secondary/20", // Default gradient
  expandable = false,
  defaultExpanded = false, // Default to collapsed
}: LifeCardProps) => {
  const [expanded, setExpanded] = useState(expandable && defaultExpanded); // Initialize based on defaultExpanded
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (contentRef.current && expandable) { // Only observe if expandable
      const updateHeight = () => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      };
      
      updateHeight(); // Initial measurement
      
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(contentRef.current);
      
      // Also re-measure if children change significantly, which might not trigger resize observer alone.
      // This is a basic way; MutationObserver would be more robust for arbitrary children changes.
      const mutationObserver = new MutationObserver(updateHeight);
      mutationObserver.observe(contentRef.current, { childList: true, subtree: true });

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    } else if (!expandable) {
        setContentHeight("auto"); // If not expandable, content height is auto
    }
  }, [expandable, children]); // Re-run if children change, affecting scrollHeight
  
  const handleToggle = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  // Ensure consistent card styling: rounded-2xl, shadow-lg. Padding is p-4 sm:p-5.
  // The motion.div applies these. Height management is key for expandable cards.
  // The title and icon section already have mb-4.
  return (
    <motion.div
      className={`card-stack-item ${color} rounded-2xl shadow-xl p-4 sm:p-6 overflow-hidden transition-all duration-300 relative border border-white/10`} // Adjusted padding, added border
      style={{
        // If not expandable, height is auto. Otherwise, controlled by expanded state.
        height: expandable ? 
          (expanded ? 
            (contentHeight === "auto" ? "auto" : contentHeight + (isMobile ? 80 : 100)) : // Approx header height + padding
            'var(--collapsed-height, 180px)' // Fallback for --collapsed-height
          ) 
          : 'auto'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout // Enables layout animations
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-3 text-primary">{icon}</div> {/* Ensure icon color is primary or passed */}
          <h2 className="font-semibold text-lg sm:text-xl text-foreground">{title}</h2> {/* Ensure text color */}
        </div>
        
        {expandable && (
          <motion.button
            onClick={handleToggle}
            className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary" // Added focus state
            whileTap={{ scale: 0.9 }}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded} // ARIA attribute
          >
            <ChevronDown
              size={isMobile ? 20 : 24} // Slightly larger icons
              className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </motion.button>
        )}
      </div>
      
      <AnimatePresence initial={false}>
        { (expanded || !expandable) && ( // Content is always present if not expandable, or if expanded
            <motion.div
              ref={contentRef}
              className={`transition-opacity duration-300 px-1 overflow-y-auto no-scrollbar`} // Allow content to scroll if it overflows calculated height
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1,
                height: expandable ? (expanded ? "auto" : `calc(var(--collapsed-height, 180px) - ${isMobile ? 80 : 100}px)`) : "auto", // Adjust height based on header
                transition: { duration: 0.3, ease: "easeInOut" }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                transition: { duration: 0.3, ease: "easeInOut" }
              }}
              style={{
                maxHeight: expandable && expanded ? 'none' : (expandable ? `calc(var(--collapsed-height, 180px) - ${isMobile ? 80 : 100}px)` : 'none') // Max height for collapsed state
              }}
            >
              {children}
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LifeCard;
