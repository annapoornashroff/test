import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, Users, IndianRupee, Check, ChevronDown, X } from 'lucide-react';
import { SUPPORTED_CITIES, type SupportedCity, WEDDING_EVENTS, SERVICE_CATEGORIES } from '@/lib/constants';
import { CreatorRole, UserProfile } from '@/lib/types/api';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleApiError } from '@/lib/api-client';

// These should match the types used in the parent forms
export interface WeddingDetailsFormProps<T> {
  userProfile: UserProfile | null;
  loading: boolean;
  setLoading: (flag: boolean) => void;
  submitLabel?: string;
}

// This is a generic controlled form for wedding details
export function WeddingDetailsForm<T extends Record<string, any>>({
  userProfile,
  loading,
  setLoading,
  submitLabel = 'Save',
}: WeddingDetailsFormProps<T>) {
  // Local state for form data
  const [formData, setFormData] = useState({
    cities: [] as SupportedCity[],
    title: '',
    date: '',
    is_date_fixed: true,
    events: [] as string[],
    duration: 2,
    estimated_guests: 200,
    budget: 1000000,
    categories: [] as string[],
    role: '' as CreatorRole
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to update a single field
  function setField<K extends keyof typeof formData>(field: K, value: typeof formData[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  // Fetch and set wedding details as form defaults
  useEffect(() => {
    // Only fetch if userProfile exists and not already fetching
    if (!userProfile) return;
    apiClient.getWeddings()
      .then((value) => {
        const projects = value as any[];
        if (projects && projects.length > 0) {
          const project = projects[0]; // Use the first wedding project
          setFormData({
            cities: project.city ? [project.city] : [],
            title: project.name || '',
            date: project.date ? project.date.split('T')[0] : '', // ISO to yyyy-mm-dd
            is_date_fixed: project.is_date_fixed ?? true,
            events: project.events || [],
            duration: project.duration || 2,
            estimated_guests: project.estimated_guests || 200,
            budget: project.budget || 1000000,
            categories: project.categories || [],
            role: project.creator_role || ''
          });
        }
      })
      .catch((err: any) => {
        console.log(err)
      });
  }, [userProfile]);

  // Handles form submission
  const onSubmit = async () => {
    if (!formData.cities.length) {
      toast.error('Please select at least one city');
      return;
    }
    setLoading(true);
    try {
      const weddingData = {
        creator_role: formData.role as CreatorRole,
        title: formData.title,
        date: formData.date ? new Date(formData.date).toISOString() : '',
        cities: formData.cities,
        is_date_fixed: formData.is_date_fixed,
        events: formData.events,
        duration: formData.duration,
        estimated_guests: formData.estimated_guests,
        budget: formData.budget,
        categories: formData.categories
      };

      await apiClient.createWedding(weddingData);
      formData.cities.length > 0?
      toast.success('Updated Wedding Plan successfully'): 
      toast.success('New Wedding Plan created successfully!');
      
      router.push('/dashboard');
    } catch (error) {
      handleApiError(error, 'Failed to update wedding plan');
    } finally {
      setLoading(false);
    }
  };

  // Render the form using formData
  return (
    <div className="space-y-6">
      {/* Wedding Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wedding Title
        </label>
        <Input
          placeholder="e.g. Rohan & Priya's Dream Wedding"
          value={formData.title}
          onChange={e => setField('title', e.target.value)}
          className="h-12"
        />
      </div>

      {/* Cities Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cities
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(formData.cities).map((city: SupportedCity) => (
            <Badge key={city} variant="secondary" className="flex items-center gap-1 pr-1">
              {city}
              <button
                type="button"
                aria-label={`Remove ${city}`}
                className="ml-1 text-xs text-gray-500 hover:text-red-500 focus:outline-none"
                onClick={() => setField('cities', (formData.cities).filter((c: SupportedCity) => c !== city))}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {(formData.cities.length === 0) && (
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
                  className={`flex items-center w-full px-4 py-2 text-sm hover:bg-primary/10 focus:bg-primary/20 transition-colors ${(formData.cities).includes(city) ? 'font-semibold text-primary' : ''}`}
                  onClick={() => {
                    const cities = formData.cities;
                    setField('cities', cities.includes(city)
                      ? cities.filter((c: SupportedCity) => c !== city)
                      : [...cities, city]);
                  }}
                >
                  <span className="flex-1 text-left">{city}</span>
                  {(formData.cities).includes(city) && <Check className="w-4 h-4 ml-2 text-primary" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Wedding Date
        </label>
        <Input
          type="date"
          value={formData.date}
          onChange={e => setField('date', e.target.value)}
          className="h-12"
        />
      </div>

      {/* Is Date Fixed */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={!!formData.is_date_fixed}
          onChange={e => setField('is_date_fixed', e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span className="text-gray-700">Date is Fixed?</span>
      </label>

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
          onChange={e => setField('duration', parseInt(e.target.value))}
          className="h-12"
        />
      </div>

      {/* Events Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select Wedding Events
        </label>
        <div className="grid grid-cols-2 gap-3">
          {WEDDING_EVENTS.map((event) => (
            <button
              key={event}
              type="button"
              onClick={() => {
                const selected = formData.events;
                setField('events', selected.includes(event)
                  ? selected.filter((e: string) => e !== event)
                  : [...selected, event]);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                (formData.events).includes(event)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              {event}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Multi-select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Service Categories
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                const selected = formData.categories;
                setField('categories', selected.includes(category)
                  ? selected.filter((c: string) => c !== category)
                  : [...selected, category]);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                (formData.categories).includes(category)
                  ? 'border-gold bg-gold text-white'
                  : 'border-gray-200 hover:border-gold'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Estimated Guests */}
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
          onChange={e => setField('estimated_guests', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <IndianRupee className="w-4 h-4 inline mr-2" />
          Estimated Budget: ₹{(formData.budget || 0).toLocaleString('en-IN')}
        </label>
        <input
          type="range"
          min="100000"
          max="5000000"
          step="100000"
          value={formData.budget}
          onChange={e => setField('budget', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={loading}
        className="w-full h-12 bg-primary hover:bg-primary-600 rounded-full"
      >
        {loading ? 'Saving...' : submitLabel}
      </Button>

      {/* TODO: Add validation, error display, and further customization as needed */}
    </div>
  );
} 