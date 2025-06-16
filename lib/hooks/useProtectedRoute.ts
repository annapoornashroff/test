'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export const useProtectedRoute = () => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !userProfile) {
      router.replace('/signup');
    } else if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, userProfile, loading, router]);
};