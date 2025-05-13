import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import WelcomeSlide from "./slides/WelcomeSlide";
import PillarsSlide from "./slides/PillarsSlide";
import VisionSlide from "./slides/VisionSlide";
import RhythmSlide from "./slides/RhythmSlide";
import HealthSlide from "./slides/HealthSlide";
import WealthSlide from "./slides/WealthSlide";
import EmotionSlide from "./slides/EmotionSlide";
import CommunitySlide from "./slides/CommunitySlide";
import CompletionSlide from "./slides/CompletionSlide";

const OnboardingSlideDeck = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide management
  const totalSlides = 9;
  
  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleCompletion = () => {
    // This will be called by CompletionSlide, but we're not using it anymore
    // as the CompletionSlide now handles navigation directly
    localStorage.setItem('hasCompletedOnboarding', 'true');
    navigate("/auth");
  };
  
  // Render the current slide
  const renderCurrentSlide = () => {
    switch (currentSlide) {
      case 0:
        return <WelcomeSlide onNext={goToNextSlide} />;
      case 1:
        return <PillarsSlide onNext={goToNextSlide} />;
      case 2:
        return (
          <VisionSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 3:
        return (
          <RhythmSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 4:
        return (
          <HealthSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 5:
        return (
          <WealthSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 6:
        return (
          <EmotionSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 7:
        return (
          <CommunitySlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 8:
        return (
          <CompletionSlide 
            onComplete={handleCompletion} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      default:
        return <WelcomeSlide onNext={goToNextSlide} />;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="flex justify-end p-4">
        <div className="flex space-x-2 items-center">
          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} of {totalSlides}
          </span>
          <div className="flex space-x-1">
            {[...Array(totalSlides)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                  i === currentSlide
                    ? "bg-primary"
                    : i < currentSlide
                    ? "bg-primary/40"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100vh-80px)] snap-y snap-mandatory overflow-y-auto">
        <div className="snap-start h-full">
          {renderCurrentSlide()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideDeck;
