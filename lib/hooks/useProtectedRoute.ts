'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { apiClient } from '../api-client';

export const useProtectedRoute = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tokenValidated, setTokenValidated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (user && !tokenValidated) {
        try {
          const token = await user.getIdToken();
          apiClient.setToken(token);
          // Validate token by making a request to the backend
          await apiClient.getCurrentUser();
          setTokenValidated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, redirect to login
          router.push('/login');
        }
      }
    };

    validateToken();
  }, [user, loading, router, tokenValidated]);

  return { user, loading, tokenValidated };
};