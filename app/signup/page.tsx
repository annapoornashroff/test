'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, User, Mail, Calendar, Heart, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';

const events = [
  'Haldi', 'Mehendi', 'Sangeet', 'Engagement', 'Wedding', 'Reception', 'Tilak', 'Roka'
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    email: '',
    city: '',
    weddingDate: '',
    isDateFixed: false,
    selectedEvents: [] as string[]
  });

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEvents: prev.selectedEvents.includes(event)
        ? prev.selectedEvents.filter(e => e !== event)
        : [...prev.selectedEvents, event]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userData = {
        phone_number: formData.phoneNumber,
        name: formData.name,
        email: formData.email,
        city: formData.city,
      };

      await apiClient.signup(userData);
      toast.success('Account created successfully!');
      router.push('/login');
    } catch (error) {
      handleApiError(error, 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.phoneNumber.length >= 10;
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      default:
        return false;
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
          {/* Progress Indicator */}
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
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-white' : 'bg-white/20'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-white text-primary' : 'bg-white/20 text-white'
              }`}>
                {step > 3 ? <Check className="w-5 h-5" /> : '3'}
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
                {step === 1 && 'Create Your Account'}
                {step === 2 && 'Personal Details'}
                {step === 3 && 'Wedding Preferences'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="h-12"
                      required
                    />
                  </div>

                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!validateStep(1)}
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

                  <div className="flex space-x-3">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-full"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 bg-primary hover:bg-primary-600 rounded-full"
                    >
                      Continue
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
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
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 rounded-full"
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 h-12 bg-primary hover:bg-primary-600 rounded-full"
                    >
                      {loading ? (
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