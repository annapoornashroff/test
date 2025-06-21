// Test comment to check tool responsiveness
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { SUPPORTED_CITIES, type SupportedCity, CREATOR_ROLES } from '@/lib/constants';
import type { CreatorRole } from '@/lib/types/api';

export default function SignupClient() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [signupLoading, setSignupLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    city: SupportedCity;
    role: CreatorRole;
  }>({
    name: '',
    email: '',
    city: SUPPORTED_CITIES[0],
    role: '' as CreatorRole,
  });

  // Redirect logic for already authenticated users
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user && userProfile) {
      router.replace('/dashboard');
    }
    // If user exists but no profile, stay on signup
  }, [user, userProfile, loading, router]);

  if (loading || signupLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-primary-700 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not present, don't render form (redirect will happen)
  if (!user) return null;
  // If userProfile exists, don't render form (redirect will happen)
  if (userProfile) return null;

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.city || !formData.role) {
      toast.error('Please fill all required fields');
      return;
    }
    setSignupLoading(true);
    try {
      await apiClient.createUserProfile({
        name: formData.name,
        email: formData.email,
        city: formData.city,
      });
      toast.success('Account created successfully!');
      router.replace('/planning');
    } catch (error) {
      handleApiError(error, 'Failed to create account');
    } finally {
      setSignupLoading(false);
    }
  }

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
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
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
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value as SupportedCity }))}
                    className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select your city</option>
                    {SUPPORTED_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am the <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as CreatorRole }))}
                    className="w-full h-12 border border-gray-300 rounded-lg px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select your role</option>
                    {CREATOR_ROLES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary-600 rounded-full"
                  disabled={signupLoading}
                >
                  {signupLoading ? 'Saving...' : 'Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 