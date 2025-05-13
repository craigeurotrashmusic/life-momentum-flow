import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import WelcomeSlide from "./slides/WelcomeSlide";
import PillarsSlide from "./slides/PillarsSlide";
import VisionSlide from "./slides/VisionSlide";
import EpochSetupSlide from "./slides/EpochSetupSlide";
import RhythmSlide from "./slides/RhythmSlide";
import HealthSlide from "./slides/HealthSlide";
import WealthSlide from "./slides/WealthSlide";
import EmotionSlide from "./slides/EmotionSlide";
import CommunitySlide from "./slides/CommunitySlide";
import CompletionSlide from "./slides/CompletionSlide";
import { useSwipeable } from "react-swipeable";
import { useIsMobile } from "@/hooks/use-mobile";

const OnboardingSlideDeck = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  // Slide management
  const totalSlides = 10;
  
  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      // Scroll to top when changing slides on mobile
      if (isMobile) {
        window.scrollTo(0, 0);
      }
    }
  };

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      // Scroll to top when changing slides on mobile
      if (isMobile) {
        window.scrollTo(0, 0);
      }
    }
  };

  const handleCompletion = () => {
    // This will be called by CompletionSlide
    localStorage.setItem('hasCompletedOnboarding', 'true');
    navigate("/auth"); // Or "/dashboard" if auth is handled by dashboard
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
          <EpochSetupSlide
            onNext={goToNextSlide}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        );
      case 4:
        return (
          <RhythmSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 5:
        return (
          <HealthSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 6:
        return (
          <WealthSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 7:
        return (
          <EmotionSlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 8:
        return (
          <CommunitySlide 
            onNext={goToNextSlide} 
            isSubmitting={isSubmitting} 
            setIsSubmitting={setIsSubmitting} 
          />
        );
      case 9:
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
    <div className="min-h-screen bg-background">
      <div className="flex justify-between p-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
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
        className="min-h-[calc(100vh-80px)] md:min-h-[calc(var(--vh,1vh)*100-80px)] overflow-y-auto pb-20"
      >
        <div className="h-full">
          {renderCurrentSlide()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSlideDeck;
