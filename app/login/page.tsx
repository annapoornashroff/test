'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const sendOTP = async () => {
    if (!formData.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await apiClient.login(formData.phoneNumber);
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      await apiClient.verifyOTP(formData.phoneNumber, formData.otp);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      handleApiError(error, 'Invalid OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      await apiClient.login(formData.phoneNumber);
      toast.success('OTP resent successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold via-gold-400 to-gold-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-20" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="flex items-center space-x-3 text-white hover:text-white/80 transition-colors">
          <ArrowLeft className="w-6 h-6" />
          <span>Back to Home</span>
        </Link>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-gold" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-serif font-bold">Forever & Co.</h1>
                <p className="text-sm opacity-90 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-center">
                Welcome Back
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

                  <button 
                    onClick={resendOTP}
                    disabled={loading}
                    className="w-full text-center text-sm text-gold hover:underline disabled:opacity-50"
                  >
                    {loading ? 'Resending...' : 'Resend OTP'}
                  </button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-white/80">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-white font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}