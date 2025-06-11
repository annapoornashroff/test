'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationContextType {
  isLoading: boolean;
  navigate: (path: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const navigate = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      router.push(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Navigation failed');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <NavigationContext.Provider value={{ isLoading, navigate, error, clearError }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 