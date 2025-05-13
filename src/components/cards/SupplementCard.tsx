
import { Heart, Plus } from 'lucide-react';
import LifeCard from './LifeCard';
import { motion } from 'framer-motion';

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  time: string;
  color: string;
  taken: boolean;
}

const supplements: Supplement[] = [
  { id: '1', name: 'Vitamin D3', dosage: '5000 IU', time: 'Morning', color: 'bg-yellow-400', taken: true },
  { id: '2', name: 'Omega-3', dosage: '1000mg', time: 'Morning', color: 'bg-blue-400', taken: true },
  { id: '3', name: 'Magnesium', dosage: '400mg', time: 'Evening', color: 'bg-purple-400', taken: false },
  { id: '4', name: 'Zinc', dosage: '25mg', time: 'Evening', color: 'bg-green-400', taken: false },
];

const SupplementCard = () => {
  return (
    <LifeCard 
      title="Supplement Stack" 
      icon={<Heart />}
      color="bg-gradient-to-br from-pink-900/30 to-red-900/30"
      expandable={true}
    >
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Today's Stack</h3>
          <span className="text-sm text-muted-foreground">2/4 taken</span>
        </div>
        
        <div className="space-y-3">
          {supplements.map(supplement => (
            <motion.div
              key={supplement.id}
              className="glass-card p-3 rounded-xl flex items-center justify-between"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${supplement.color}`}></div>
                <div>
                  <h4 className="font-medium text-sm">{supplement.name}</h4>
                  <p className="text-xs text-muted-foreground">{supplement.dosage} · {supplement.time}</p>
                </div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border ${supplement.taken ? 'bg-primary border-primary' : 'border-muted-foreground'} flex items-center justify-center`}>
                {supplement.taken && <span className="text-primary-foreground text-xs">✓</span>}
              </div>
            </motion.div>
          ))}
        </div>
        
        <button 
          className="w-full mt-6 py-2 rounded-xl border border-border flex items-center justify-center gap-2 hover:bg-secondary/50 transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm">Add Supplement</span>
        </button>
      </div>
    </LifeCard>
  );
};

export default SupplementCard;
