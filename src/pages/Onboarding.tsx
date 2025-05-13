
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingSlideDeck from "@/components/onboarding/OnboardingSlideDeck";

const Onboarding = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return <OnboardingSlideDeck />;
};

export default Onboarding;
