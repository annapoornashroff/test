'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, MapPin, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile, user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: ''
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const redirect = searchParams.get('redirect');
      const authUrl = redirect ? `/auth?redirect=${encodeURIComponent(redirect)}` : '/auth';
      router.replace(authUrl);
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

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProfileLoading(true);
    try {
      await apiClient.createUserProfile({
        name: formData.name,
        email: formData.email,
        city: formData.city
      });
      
      await refreshUserProfile();
      toast.success('Profile completed successfully!');
      
      const redirect = searchParams.get('redirect');
      const referrer = typeof window !== 'undefined' ? document.referrer : '';
      
      if (redirect) {
        const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
        router.push(safeRedirect);
      } else if (referrer && referrer.includes(window.location.origin) && !referrer.includes('/complete-profile') && !referrer.includes('/login') && !referrer.includes('/signup') && !referrer.includes('/auth')) {
        const referrerPath = new URL(referrer).pathname;
        router.push(referrerPath);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      handleApiError(error, 'Failed to complete profile');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-700 relative overflow-hidden">
      <div className="absolute inset-0 indian-pattern opacity-20" />
      
      <main className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-center">
              Complete Your Profile
            </CardTitle>
            <p className="text-center text-gray-600">
              Just a few more details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  City *
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}