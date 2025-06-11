'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { type CityContextType } from '@/lib/types/ui';

interface CityContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  clearCity: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string>('All');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize city from URL params
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setSelectedCityState(cityParam);
    }
  }, [searchParams]);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    
    // Update URL with city parameter
    const params = new URLSearchParams(searchParams.toString());
    if (city === 'All') {
      params.delete('city');
    } else {
      params.set('city', city);
    }
    
    // Preserve other query parameters
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  const clearCity = () => {
    setSelectedCityState('All');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, clearCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
} 