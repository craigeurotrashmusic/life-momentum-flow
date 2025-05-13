
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { prefetchDashboardData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { SlideProps } from "./types";

interface CompletionSlideProps {
  onComplete: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const CompletionSlide = ({ onComplete, isSubmitting, setIsSubmitting }: CompletionSlideProps) => {
  useEffect(() => {
    // Prefetch dashboard data in the background
    const prefetchData = async () => {
      try {
        await prefetchDashboardData();
      } catch (error) {
        console.error("Error prefetching dashboard data:", error);
      }
    };
    
    prefetchData();
  }, []);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Final setup before redirecting to dashboard
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
      console.error("Error completing onboarding:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center h-full px-6 py-10 md:px-20"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-8 w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
          You're All Set!
        </h1>

        <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
          Thanks! We're populating your dashboard now.
        </p>

        <div className="mt-8">
          <Button
            onClick={handleComplete}
            size="lg"
            className="rounded-full px-8 py-6 text-lg group"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Preparing Dashboard..." : "Get Started"}
            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CompletionSlide;
