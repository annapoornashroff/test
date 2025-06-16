'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Heart, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

const events = [
  'Haldi', 'Mehendi', 'Sangeet', 'Engagement', 'Wedding', 'Reception', 'Tilak', 'Roka'
];

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [signupLoading, setSignupLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    weddingDate: '',
    isDateFixed: false,
    selectedEvents: [] as string[]
  });

  // Redirect logic for already authenticated users
  useEffect(() => {
    console.log('Signup', user, userProfile);
    if (!loading && user && userProfile) {
      const redirect = searchParams.get('redirect');
      const referrer = typeof window !== 'undefined' ? document.referrer : '';

      if (redirect && !referrer.includes('/login') && !referrer.includes('/signup')) {
        const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
        router.replace(safeRedirect);
      } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/login') && !referrer.includes('/signup')) {
        const referrerPath = new URL(referrer).pathname;
        router.replace(referrerPath);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router, searchParams]);

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

  if (user && userProfile) {
    return null;
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(event)
        ? prev.selectedEvents.filter(e => e !== event)
        : [...prev.selectedEvents, event]
    }));
  };

  const handleSubmit = async () => {
    setSignupLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        city: formData.city,
      };

      await apiClient.createUserProfile(userData);
      toast.success('Account created successfully!');
      
      // Preserve redirect parameter when going to login
      const redirect = searchParams.get('redirect');
      const loginUrl = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
      router.push(loginUrl);
    } catch (error) {
      handleApiError(error, 'Failed to create account');
    } finally {
      setSignupLoading(false);
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
          <span>Back to Planning</span>
        </Link>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator - Now 2 steps instead of 3 */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-white text-primary' : 'bg-white/20 text-white'
              }`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-white text-primary' : 'bg-white/20 text-white'
              }`}>
                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-serif font-bold">Forever & Co.</h1>
                <p className="text-sm opacity-90 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-center">
                {step === 1 && 'Personal Details'}
                {step === 2 && 'Wedding Preferences'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <Input
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      placeholder="City, State"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full h-12 bg-primary hover:bg-primary-600 rounded-full"
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Wedding Date
                    </label>
                    <Input
                      type="date"
                      value={formData.weddingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                      className="h-12"
                    />
                  </div>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.isDateFixed}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDateFixed: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-gray-700">Wedding date is confirmed</span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Wedding Events
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {events.map((event) => (
                        <button
                          key={event}
                          onClick={() => toggleEvent(event)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.selectedEvents.includes(event)
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          {event}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-full"
                      disabled={signupLoading}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={signupLoading}
                      className="flex-1 h-12 bg-primary hover:bg-primary-600 rounded-full"
                    >
                      {signupLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-white/80">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}