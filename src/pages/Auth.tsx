
import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { motion } from 'framer-motion';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="absolute top-8 left-0 w-full text-center">
        <motion.h1 
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Momentum OS
        </motion.h1>
      </div>
      
      <motion.div 
        className="glass-card rounded-2xl w-full max-w-md p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AuthForm isLoading={isLoading} setIsLoading={setIsLoading} />
      </motion.div>
    </div>
  );
};

export default Auth;
