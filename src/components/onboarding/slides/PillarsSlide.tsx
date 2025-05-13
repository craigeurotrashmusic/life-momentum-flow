
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SlideProps } from "./types";

const PillarsSlide = ({ onNext }: SlideProps) => {
  const pillars = [
    {
      title: "MPOS",
      description: "Metabolism, Psychology, Organ Systems & Sleep - Your health foundation"
    },
    {
      title: "Wealth Alignment",
      description: "Financial insights, goals and resource optimization"
    },
    {
      title: "Flow & Focus",
      description: "Peak performance states and deep work optimization"
    },
    {
      title: "Legacy & Reflection",
      description: "Long-term vision and continuous improvement"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20 pb-24"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gradient">
          Pillars That Power You
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
              <p className="text-muted-foreground">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="rounded-full px-8 py-6 text-lg group fixed-mobile-button"
          >
            Next
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PillarsSlide;
