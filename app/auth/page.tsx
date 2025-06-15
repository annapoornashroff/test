'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhoneAuthService } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { ProfileStatusResponse } from '@/lib/types/api';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { processQueuedActions } = useCart();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  
  const phoneAuthService = new PhoneAuthService();

  // Redirect logic for already authenticated users
  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get('redirect');
      const referrer = typeof window !== 'undefined' ? document.referrer : '';
      
      if (redirect) {
        const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
        router.replace(safeRedirect);
      } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/login') && !referrer.includes('/signup') && !referrer.includes('/auth')) {
        const referrerPath = new URL(referrer).pathname;
        router.replace(referrerPath);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-700 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const sendOTP = async () => {
    if (!formData.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setAuthLoading(true);
    try {
      const verificationId = await phoneAuthService.sendOTP(formData.phoneNumber);
      setVerificationId(verificationId);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await phoneAuthService.verifyOTP(verificationId, formData.otp);
      
      const profileStatus: ProfileStatusResponse = await apiClient.getProfileStatus();
      await processQueuedActions();
      
      const redirect = searchParams.get('redirect');
      const referrer = typeof window !== 'undefined' ? document.referrer : '';
      
      if (profileStatus.profile_complete) {
        if (redirect) {
          const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
          router.push(safeRedirect);
        } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/login') && !referrer.includes('/signup') && !referrer.includes('/auth')) {
          const referrerPath = new URL(referrer).pathname;
          router.push(referrerPath);
        } else {
          router.push('/dashboard');
        }
        toast.success('Welcome back!');
      } else {
        let completeProfileUrl = '/complete-profile';
        if (redirect) {
          completeProfileUrl += `?redirect=${encodeURIComponent(redirect)}`;
        } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/login') && !referrer.includes('/signup') && !referrer.includes('/auth')) {
          const referrerPath = new URL(referrer).pathname;
          completeProfileUrl += `?redirect=${encodeURIComponent(referrerPath.substring(1))}`;
        }
        router.push(completeProfileUrl);
        toast.success('Please complete your profile to continue');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ... rest of the component remains similar to current login page
}