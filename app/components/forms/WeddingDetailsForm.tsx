import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, Users, IndianRupee, Check, ChevronDown, X } from 'lucide-react';
import { SUPPORTED_CITIES, WEDDING_EVENTS, SERVICE_CATEGORIES, CREATOR_ROLES } from '@/lib/constants';
import { UserProfile, WeddingData } from '@/lib/types/api';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleApiError } from '@/lib/api-client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
  const [formData, setFormData] = useState<WeddingData>({
    cities: [] as (typeof SUPPORTED_CITIES)[number][],
    title: '',
    date: '',
    is_date_fixed: true,
    events: [] as string[],
    duration: 2,
    estimated_guests: 200,
    budget: 1000000,
    categories: [] as string[],
    creator_role: CREATOR_ROLES[0],
    timezone: typeof window !== 'undefined'? Intl.DateTimeFormat().resolvedOptions().timeZone: 'Asia/Kolkata',
    status: 'PLANNING',
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use only built-in Intl API for timezone list
  const timezoneOptions = React.useMemo(() => {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }
    return [];
  }, []);

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
        const weddings = value as WeddingData[];
        if (weddings && weddings.length > 0) {
          const wedding = weddings[0]; // Use the first wedding project
          setFormData({
            cities: wedding.cities || [],
            title: wedding.title || '',
            date: wedding.date ? wedding.date.split('T')[0] : '', // ISO to yyyy-mm-dd
            is_date_fixed: wedding.is_date_fixed ?? true,
            events: wedding.events || [],
            duration: wedding.duration || 2,
            estimated_guests: wedding.estimated_guests || 200,
            budget: wedding.budget || 1000000,
            categories: wedding.categories || [],
            creator_role: wedding.creator_role || CREATOR_ROLES[0],
            timezone: wedding.timezone || (typeof window !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'),
            status: wedding.status || 'PLANNING'
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
        creator_role: formData.creator_role as (typeof CREATOR_ROLES)[number],
        title: formData.title,
        date: formData.date ? new Date(formData.date).toISOString() : '',
        cities: formData.cities,
        is_date_fixed: formData.is_date_fixed,
        events: formData.events,
        duration: formData.duration,
        estimated_guests: formData.estimated_guests,
        budget: formData.budget,
        categories: formData.categories,
        timezone: formData.timezone,
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
      {/* Creator Role Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-700">I am the</span>
          <Select
            value={formData.creator_role}
            onValueChange={value => setField('creator_role', value as (typeof CREATOR_ROLES)[number])}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {CREATOR_ROLES.map(role => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
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
          {(formData.cities).map((city: (typeof SUPPORTED_CITIES)[number]) => (
            <Badge key={city} variant="secondary" className="flex items-center gap-1 pr-1">
              {city === 'DELHI'? 'DELHI (NCR)': city}
              <button
                type="button"
                aria-label={`Remove ${city}`}
                className="ml-1 text-xs text-gray-500 hover:text-red-500 focus:outline-none"
                onClick={() => setField('cities', (formData.cities).filter((c: (typeof SUPPORTED_CITIES)[number]) => c !== city))}
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
                Select Cities
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
                      ? cities.filter((c: (typeof SUPPORTED_CITIES)[number]) => c !== city)
                      : [...cities, city]);
                  }}
                >
                  <span className="flex-1 text-left">{city === 'DELHI'? 'DELHI (NCR)': city}</span>
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

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <Select
          value={formData.timezone}
          onValueChange={value => setField('timezone', value)}
        >
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezoneOptions.map(tz => (
              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      {/* Note: WEDDING_EVENTS values are now UPPERCASE for backend compatibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Select Wedding Events
        </label>
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const allSelected = WEDDING_EVENTS.every(event => formData.events.includes(event.value));
              setField('events', allSelected ? [] : WEDDING_EVENTS.map(e => e.value));
            }}
            className="px-3 py-1"
          >
            {WEDDING_EVENTS.every(event => formData.events.includes(event.value)) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WEDDING_EVENTS.map((event) => (
            <button
              key={event.value}
              type="button"
              onClick={() => {
                const selected = formData.events;
                setField('events', selected.includes(event.value)
                  ? selected.filter((e: string) => e !== event.value)
                  : [...selected, event.value]);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                (formData.events).includes(event.value)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 hover:border-primary'
              }`}
            >
              {event.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Multi-select */}
      {/* Note: SERVICE_CATEGORIES values are now UPPERCASE for backend compatibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Service Categories
        </label>
        <div className="flex justify-end mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const allSelected = SERVICE_CATEGORIES.every(category => formData.categories.includes(category.value));
              setField('categories', allSelected ? [] : SERVICE_CATEGORIES.map(c => c.value));
            }}
            className="px-3 py-1"
          >
            {SERVICE_CATEGORIES.every(category => formData.categories.includes(category.value)) ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => {
                const selected = formData.categories;
                setField('categories', selected.includes(category.value)
                  ? selected.filter((c: string) => c !== category.value)
                  : [...selected, category.value]);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                (formData.categories).includes(category.value)
                  ? 'border-gold bg-gold text-white'
                  : 'border-gray-200 hover:border-gold'
              }`}
            >
              {category.label}
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