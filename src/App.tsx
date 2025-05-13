
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Check authentication status and onboarding completion on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    const onboardingStatus = localStorage.getItem('hasCompletedOnboarding') === 'true';
    setHasCompletedOnboarding(onboardingStatus);
  }, []);

  // Show nothing while checking auth status
  if (isAuthenticated === null || hasCompletedOnboarding === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated 
                  ? hasCompletedOnboarding 
                    ? <Home /> 
                    : <Navigate to="/onboarding" replace />
                  : <Navigate to="/auth" replace />
              } 
            />
            <Route 
              path="/auth" 
              element={isAuthenticated ? <Navigate to="/" replace /> : <Auth />} 
            />
            <Route 
              path="/onboarding" 
              element={
                isAuthenticated 
                  ? hasCompletedOnboarding 
                    ? <Navigate to="/" replace /> 
                    : <Onboarding />
                  : <Navigate to="/auth" replace />
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
