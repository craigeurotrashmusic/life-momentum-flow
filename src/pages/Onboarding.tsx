
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingSlideDeck from "@/components/onboarding/OnboardingSlideDeck";

const Onboarding = () => {
  const navigate = useNavigate();
  
  // Add mobile-specific styles when the onboarding component mounts
  useEffect(() => {
    // Add a style tag for the fixed button on mobile
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @media (max-width: 767px) {
        .fixed-mobile-button {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      }
    `;
    document.head.appendChild(styleEl);
    
    // Clean up
    return () => {
      document.head.removeChild(styleEl);
    }
  }, []);
  
  return <OnboardingSlideDeck />;
};

export default Onboarding;
