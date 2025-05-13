
import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
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
  
  const handleToggle = () => {
    if (expandable) {
      setExpanded(!expanded);
    }
  };

  return (
    <div
      className={`card-stack-item ${color} rounded-2xl shadow-lg p-5 overflow-hidden transition-all duration-300 relative`}
      style={{
        height: expanded ? 'var(--expanded-height)' : 'var(--collapsed-height)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="mr-3 text-foreground">{icon}</div>
          <h2 className="font-semibold text-xl">{title}</h2>
        </div>
        
        {expandable && (
          <button
            onClick={handleToggle}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronDown
              size={20}
              className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
      
      <div
        className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-90'}`}
      >
        {children}
      </div>
    </div>
  );
};

export default LifeCard;
