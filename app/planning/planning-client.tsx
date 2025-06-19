'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, IndianRupee, Heart, ArrowRight, Loader2, Check, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient } from '@/lib/api-client';

import { handleApiError } from '@/lib/api-client';
import { WeddingData } from '@/lib/types/api';
import { toast } from 'sonner';
import { SupportedCity, SUPPORTED_CITIES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

const events = [
  'Haldi', 'Mehendi', 'Sangeet', 'Engagement', 'Wedding', 'Reception', 'Tilak', 'Roka'
];

const categories = [
  'Venue', 'Photography', 'Catering', 'Decoration', 'Makeup Artist', 'Anchor', 'Choreographer', 'Photo Albums'
];

export default function PlanningClient() {
  const router = useRouter();
  const { user } = useAuth();
  useProtectedRoute();
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<WeddingData>({
    title: 'My Wedding',
    cities: ['Delhi'],
    date: '',
    is_date_fixed: false,
    duration: 2,
    events: [],
    categories: [],
    estimated_guests: 200,
    budget: 500000
  });

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleCity = (city: SupportedCity) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }));
  };

  const removeCity = (city: SupportedCity) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.filter(c => c !== city)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.cities.length || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('weddingPlanningData', JSON.stringify(formData));
      }
      router.push('/signup');
      return;
    }

    try {
      setLoading(true);
      
      // Create wedding project with ISO date string
      const weddingData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : ''
      };
      
      await apiClient.createWedding(weddingData);
      
      toast.success('Wedding project created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      handleApiError(error, 'Failed to create wedding project');
    } finally {
      setLoading(false);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gold-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
              <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
              Plan Your Dream Wedding
            </h1>
            <p className="text-lg text-gray-600">
              Tell us about your special day and we&apos;ll create the perfect plan for you
            </p>
          </div>

          {/* Planning Form */}
          <Card className="bg-white rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-center">Wedding Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Wedding Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Title
                </label>
                <Input
                  placeholder="Enter a Title for your Wedding"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              {/* City - Multi-select with chips */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Wedding Cities
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.cities.map((city) => (
                    <Badge key={city} variant="secondary" className="flex items-center gap-1 pr-1">
                      {city}
                      <button
                        type="button"
                        aria-label={`Remove ${city}`}
                        className="ml-1 text-xs text-gray-500 hover:text-red-500 focus:outline-none"
                        onClick={() => removeCity(city)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}name
                  {formData.cities.length === 0 && (
                    <span className="text-gray-400 text-sm">No cities selected</span>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center w-full h-12 border rounded-md px-3 bg-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <span className="flex-1 text-left">
                        {formData.cities.length > 0 ? 'Edit Cities' : 'Select Cities'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0 w-full min-w-[200px]">
                    <div className="max-h-60 overflow-y-auto divide-y">
                      {SUPPORTED_CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-primary/10 focus:bg-primary/20 transition-colors ${formData.cities.includes(city) ? 'font-semibold text-primary' : ''}`}
                          onClick={() => toggleCity(city)}
                        >
                          <span className="flex-1 text-left">{city}</span>
                          {formData.cities.includes(city) && <Check className="w-4 h-4 ml-2 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Wedding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Wedding Date
                </label>
                <div className="space-y-3">
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-12"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_date_fixed}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_date_fixed: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Date is fixed</span>
                  </label>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wedding Duration (Days)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="h-12"
                />
              </div>

              {/* Events */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Events
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {events.map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEvent(event)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.events.includes(event)
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Service Categories
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.categories.includes(category)
                          ? 'border-gold bg-gold text-white'
                          : 'border-gray-200 hover:border-gold'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Estimated Guests: {formData.estimated_guests}
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={formData.estimated_guests}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_guests: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="w-4 h-4 inline mr-2" />
                  Estimated Budget: ₹{formData.budget.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="100000"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-primary hover:bg-primary-600 text-lg rounded-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    Start Planning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Login here</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 