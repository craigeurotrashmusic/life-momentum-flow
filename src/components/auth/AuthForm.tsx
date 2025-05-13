
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication for demo
    if (email && password) {
      toast({
        title: isLogin ? "Logged in successfully" : "Account created successfully",
        description: isLogin ? "Welcome back!" : "Welcome to Momentum OS!",
      });
      // Normally we would handle actual auth here
      localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '/';
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-muted-foreground">
          {isLogin ? 'Sign in to your account' : 'Start your productivity journey'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input 
            id="email"
            type="email" 
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input 
            id="password"
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button type="submit" className="w-full">
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-accent hover:underline text-sm"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
