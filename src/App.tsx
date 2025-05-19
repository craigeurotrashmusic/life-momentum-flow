
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
import { ClarityHubProvider } from './contexts/ClarityHubContext';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from "@/hooks/use-toast";

// Set up with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Define header height CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', '61px');
    
    // Set up viewport height CSS variable for mobile browsers
    const setVhVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Run it initially
    setVhVariable();
    
    // Re-run on resize
    window.addEventListener('resize', setVhVariable);
    return () => window.removeEventListener('resize', setVhVariable);
  }, []);

  // Check authentication status and onboarding completion on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    const onboardingStatus = localStorage.getItem('hasCompletedOnboarding') === 'true';
    setHasCompletedOnboarding(onboardingStatus);
  }, []);

  // Show loading state while checking auth status
  if (isAuthenticated === null || hasCompletedOnboarding === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading Momentum OS...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ClarityHubProvider>
            <ToastProvider>
              <Toaster />
              <Sonner position="bottom-center" closeButton toastOptions={{ style: { borderRadius: '0.75rem' } }} />
              <BrowserRouter>
                {/* Added padding-top to account for fixed header */}
                <div className="pt-[var(--header-height)] min-h-screen">
                  <Routes>
                    {/* Root path - entry point for all users */}
                    <Route 
                      path="/" 
                      element={
                        isAuthenticated 
                          ? <Home /> 
                          : hasCompletedOnboarding 
                            ? <Navigate to="/auth" replace /> 
                            : <Navigate to="/onboarding" replace />
                      } 
                    />
                    
                    {/* Auth route - handles both login and signup */}
                    <Route 
                      path="/auth" 
                      element={
                        isAuthenticated 
                          ? <Navigate to="/" replace /> 
                          : <Auth />
                      } 
                    />
                    
                    {/* Onboarding route - for new users who haven't completed onboarding */}
                    <Route 
                      path="/onboarding" 
                      element={
                        hasCompletedOnboarding 
                          ? <Navigate to="/auth" replace />
                          : <Onboarding />
                      } 
                    />
                    
                    {/* Catch all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </ToastProvider>
          </ClarityHubProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
