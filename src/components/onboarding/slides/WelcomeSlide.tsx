
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SlideProps } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

const WelcomeSlide = ({ onNext }: SlideProps) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-4 py-6 md:px-20 md:py-10"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold mb-6 text-gradient`}>
          Welcome to Momentum OS
        </h1>
        
        <p className={`${isMobile ? 'text-lg' : 'text-xl md:text-2xl'} mb-8 md:mb-12 text-muted-foreground`}>
          Your personal ecosystem for Health, Wealth, Creativity & Growth. Let's set you up!
        </p>
        
        <div className="mt-4 md:mt-8">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="rounded-full px-8 py-6 text-lg group min-h-[60px] min-w-[200px]"
          >
            Let's get started
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeSlide;
