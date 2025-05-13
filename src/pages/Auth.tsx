
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="absolute top-8 left-0 w-full text-center">
        <h1 className="text-2xl font-bold text-foreground">Momentum OS</h1>
      </div>
      
      <div className="glass-card rounded-2xl w-full max-w-md p-8">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
