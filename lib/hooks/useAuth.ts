'use client';

import { useAuth as useAuthContext } from '../auth-context';

export const useAuth = () => {
  return useAuthContext();
};