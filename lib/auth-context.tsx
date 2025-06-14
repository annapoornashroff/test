'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from './firebase';
import { apiClient } from './api-client';
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
        console.error('Error fetching user profile:', error);
        // If user doesn't exist in backend, create them
        try {
          const token = await user.getIdToken();
          apiClient.setToken(token);
          // Remove phone_number from the request - it should come from Firebase token
          const newProfile = await apiClient.createUserProfile({
            id: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            createdAt: user.metadata.creationTime || new Date().toUTCString(),
          });
          setUserProfile(newProfile);
        } catch (createError) {
          console.error('Error creating user profile:', createError);
          // If backend user creation fails, sign out Firebase user to prevent loop
          toast.error('Failed to create user profile. Please try signing up again.');
          await signOut(auth);
          apiClient.clearToken();
          // Redirect to signup page instead of login
          if (typeof window !== 'undefined') {
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