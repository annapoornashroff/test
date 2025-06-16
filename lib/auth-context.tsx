'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from './firebase';
import { apiClient, ApiError } from './api-client';
import { type AuthContextType } from '@/lib/types/ui';
import { UserProfile } from './types/api';

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      try {
        const token = await user.getIdToken();
        apiClient.setToken(token);
        const profile = await apiClient.getCurrentUser();
        setUserProfile(profile);
      } catch (error) {
        if ((error as ApiError).status === 401 && typeof window !== 'undefined' && !window.location.href.includes('/signup')) {
          apiClient.clearToken(); // Clear API token
          toast.error('Session expired. Please login again.');
          await signOut(auth);
        } else {
          // For all other errors, or a 401 when already on signup page, assume missing profile
          toast.error('User profile not found. Please sign up.');
          if (typeof window !== 'undefined' && !window.location.href.includes('/signup')) {
            window.location.href = '/signup';
          }
        }
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      apiClient.clearToken(); // Clear API token on explicit sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        await refreshUserProfile();
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUserProfile]);

  const value = {
    user,
    userProfile,
    loading,
    signOut: handleSignOut,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};