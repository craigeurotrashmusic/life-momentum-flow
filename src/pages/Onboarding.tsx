
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingSlideDeck from "@/components/onboarding/OnboardingSlideDeck";

const Onboarding = () => {
  const navigate = useNavigate();
  
  // New users don't need to be authenticated to begin onboarding
  // They'll be prompted to create an account at the end
  
  return <OnboardingSlideDeck />;
};

export default Onboarding;
