'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { type CityContextType, CityType } from '@/lib/types/ui';
import { SUPPORTED_CITIES } from '@/lib/constants';

const CityContext = createContext<CityContextType | undefined>(undefined);

// TODO : Add support for multiple cities or 'All'
export function CityProvider({ children }: { children: React.ReactNode }) {
  // Default to 'All' instead of first city
  const [selectedCity, setSelectedCityState] = useState<CityType>('All');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize city from URL params
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam === 'All') {
      setSelectedCityState('All');
    } else if (cityParam && SUPPORTED_CITIES.includes(cityParam as (typeof SUPPORTED_CITIES)[number])) {
      setSelectedCityState(cityParam as (typeof SUPPORTED_CITIES)[number]);
    }
  }, [searchParams]);

  // Accept 'All' or a supported city
  const setSelectedCity = (city: CityType) => {
    if (city !== 'All' && !SUPPORTED_CITIES.includes(city)) {
      console.error(`Invalid city: ${city}`);
      return;
    }
    setSelectedCityState(city);
    const params = new URLSearchParams(searchParams.toString());
    if (city === 'All') {
      params.delete('city');
    } else {
      params.set('city', city);
    }
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  // Clear city to 'All'
  const clearCity = () => {
    setSelectedCityState('All');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  };

  // Provide context with updated types
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