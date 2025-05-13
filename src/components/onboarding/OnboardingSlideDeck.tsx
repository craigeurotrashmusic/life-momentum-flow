
import { useState } from "react";
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
import { useSwipeable } from "react-swipeable";

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

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleCompletion = () => {
    // This will be called by CompletionSlide, but we're not using it anymore
    // as the CompletionSlide now handles navigation directly
    localStorage.setItem('hasCompletedOnboarding', 'true');
    navigate("/auth");
  };
  
  // Setup swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPrevSlide(),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });
  
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
      <div className="flex justify-between p-4">
        <button 
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous slide"
        >
          {currentSlide > 0 && (
            <ChevronRight className="w-5 h-5 transform rotate-180" />
          )}
        </button>
        
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
      
      <div 
        {...swipeHandlers}
        className="h-[calc(var(--vh,1vh)*100-var(--header-height))] overflow-y-auto snap-y snap-mandatory"
      >
        <div className="snap-start h-full">
          {renderCurrentSlide()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideDeck;
