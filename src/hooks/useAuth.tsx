
import { useState, useEffect, createContext, useContext } from 'react';

// Define user type
interface User {
  id: string;
  email?: string;
  name?: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for user on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      if (storedAuth === 'true') {
        // In a real app, we'd verify the token with the backend
        // For now, we'll simulate a user
        setUser({
          id: 'user-123',
          email: 'user@example.com',
          name: 'Demo User',
        });
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Auth methods
  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would call an API endpoint
      // For now, just simulate successful authentication
      const mockUser = { id: 'user-123', email, name: 'Demo User' };
      localStorage.setItem('isAuthenticated', 'true');
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      // In a real app, this would call an API endpoint
      // For now, just simulate successful registration
      const mockUser = { id: 'user-123', email, name: 'Demo User' };
      localStorage.setItem('isAuthenticated', 'true');
      setUser(mockUser);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear auth data
    localStorage.removeItem('isAuthenticated');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
