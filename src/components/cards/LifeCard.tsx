
import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface LifeCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  color?: string;
  expandable?: boolean;
}

const LifeCard = ({
  title,
  icon,
  children,
  color = "bg-gradient-to-br from-primary/20 to-secondary/20",
  expandable = false
}: LifeCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  
  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });
      
      resizeObserver.observe(contentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  const handleToggle = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  return (
    <motion.div
      className={`card-stack-item ${color} rounded-2xl shadow-lg p-5 overflow-hidden transition-all duration-300 relative`}
      style={{
        height: expanded ? 
          (contentHeight === "auto" ? "auto" : contentHeight + 100) : 
          'var(--collapsed-height)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-3 text-foreground">{icon}</div>
          <h2 className="font-semibold text-xl">{title}</h2>
        </div>
        
        {expandable && (
          <motion.button
            onClick={handleToggle}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDown
              size={20}
              className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        <motion.div
          ref={contentRef}
          className={`transition-all duration-300`}
          initial={false}
          animate={{ 
            opacity: expanded ? 1 : 0.9,
            height: expanded ? "auto" : "calc(var(--collapsed-height) - 100px)"
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LifeCard;
