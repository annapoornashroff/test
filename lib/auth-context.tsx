'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { apiClient } from './api';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

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
        const profile = await apiClient.getCurrentUser(token);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // If user doesn't exist in backend, create them
        try {
          const token = await user.getIdToken();
          const newProfile = await apiClient.createUserProfile(token, {
            phoneNumber: user.phoneNumber || '',
            name: user.displayName || '',
            email: user.email || '',
          });
          setUserProfile(newProfile);
        } catch (createError) {
          console.error('Error creating user profile:', createError);
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