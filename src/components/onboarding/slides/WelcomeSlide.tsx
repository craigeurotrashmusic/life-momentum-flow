
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { SlideProps } from "./types";

const WelcomeSlide = ({ onNext }: SlideProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20"
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
          Welcome to Momentum OS
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
          Your personal ecosystem for Health, Wealth, Creativity & Growth. Let's set you up!
        </p>
        
        <div className="mt-8">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="rounded-full px-8 py-6 text-lg group"
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
