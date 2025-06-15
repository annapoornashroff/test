'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PhoneAuthService } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/hooks/useCart';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { processQueuedActions } = useCart();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
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

    setLoginLoading(true);
    try {
      const verificationId = await phoneAuthService.sendOTP(formData.phoneNumber);
      setVerificationId(verificationId);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoginLoading(false);
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
      
      await processQueuedActions();
      
      const redirect = searchParams.get('redirect');
      const referrer = typeof window !== 'undefined' ? document.referrer : '';
      
      if (redirect) {
        const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
        router.push(safeRedirect);
      } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/login') && !referrer.includes('/signup') && !referrer.includes('/auth')) {
        const referrerPath = new URL(referrer).pathname;
        router.push(referrerPath);
      } else {
        router.push('/dashboard');
      }
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoginLoading(true);
    try {
      const newVerificationId = await phoneAuthService.sendOTP(formData.phoneNumber);
      setVerificationId(newVerificationId);
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-20" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/planning" className="flex items-center space-x-3 text-white hover:text-white/80 transition-colors">
          <ArrowLeft className="w-6 h-6" />
          <span className="text-lg font-medium">Back to Planning</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">
              {searchParams.get('redirect') === 'cart' ? 'Sign in to continue shopping' : 'Welcome Back'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="h-12"
                    disabled={loading}
                  />
                </div>

                <Button 
                  onClick={sendOTP}
                  disabled={!formData.phoneNumber || loading}
                  className="w-full h-12 bg-gold hover:bg-gold-600 rounded-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="text-center text-sm text-gray-600 mb-4">
                  OTP sent to {formData.phoneNumber}
                  <button 
                    onClick={resendOTP}
                    disabled={loading}
                    className="ml-2 text-primary hover:text-primary-600 underline"
                  >
                    {loading ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Enter OTP
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    className="h-12 text-center text-lg tracking-widest"
                    maxLength={6}
                    disabled={otpLoading}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setOtpSent(false);
                      setFormData(prev => ({ ...prev, otp: '' }));
                    }}
                    className="flex-1 h-12 rounded-full"
                    disabled={otpLoading}
                  >
                    Change Number
                  </Button>
                  <Button 
                    onClick={verifyOTP}
                    disabled={formData.otp.length !== 6 || otpLoading}
                    className="flex-1 h-12 bg-gold hover:bg-gold-600 rounded-full"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Login'
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
          {/* reCAPTCHA container - required for phone authentication */}
          <div id="recaptcha-container" className="hidden"></div>
        </Card>
      </main>
    </div>
  );
}