'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, IndianRupee, Heart, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient } from '@/lib/api';
import { handleApiError } from '@/lib/api-client';
import { WeddingData } from '@/lib/types/api';
import { toast } from 'sonner';

const events = [
  'Haldi', 'Mehendi', 'Sangeet', 'Engagement', 'Wedding', 'Reception', 'Tilak', 'Roka'
];

const categories = [
  'Venue', 'Photography', 'Catering', 'Decoration', 'Makeup Artist', 'Anchor', 'Choreographer', 'Photo Albums'
];

export default function PlanningPage() {
  const router = useRouter();
  const { user } = useAuth();
  useProtectedRoute();
  
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<WeddingData>({
    name: 'My Wedding',
    city: '',
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

  const handleSubmit = async () => {
    if (!formData.city || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      // If not logged in, save to localStorage and redirect to signup
      if (typeof window !== 'undefined') {
        localStorage.setItem('weddingPlanningData', JSON.stringify(formData));
      }
      router.push('/signup');
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      
      // Create wedding project
      await apiClient.createWedding(token, formData);
      
      toast.success('Wedding project created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      handleApiError(error, 'Failed to create wedding project');
    } finally {
      setLoading(false);
    }
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
                  Wedding Name
                </label>
                <Input
                  placeholder="Enter a name for your wedding project"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12"
                />
              </div>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Wedding City
                </label>
                <Input
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="h-12"
                />
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>50</span>
                  <span>1000+</span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IndianRupee className="w-4 h-4 inline mr-2" />
                  Budget: ₹{formData.budget.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="100000"
                  max="5000000"
                  step="50000"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹1L</span>
                  <span>₹50L+</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                size="xl" 
                className="w-full bg-primary hover:bg-primary-600 rounded-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : user ? (
                  <>
                    Create Wedding Project
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Continue to Sign Up
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}