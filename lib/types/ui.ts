// UI Component Types
import { type DialogProps } from '@radix-ui/react-dialog';
import { Toast, ToastAction } from '@/components/ui/toast';
import { Toaster as Sonner } from 'sonner';
import { badgeVariants } from '@/lib/styles/badge';
import { VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';
import { type ReviewResponse } from './api';
import { UserProfile } from './api';
import { type SupportedCity } from '@/lib/constants';
import internal from 'node:stream';
import { User } from 'firebase/auth';

// Loading Components
export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Review Components
export interface ReviewCardProps {
  review: ReviewResponse;
  isActive?: boolean;
  className?: string;
}

export interface ReviewStatsProps {
  stats: {
    total_reviews: number;
    average_rating: number;
    recent_reviews_count: number;
    wedding_related_count: number;
    rating_distribution: Record<number, number>;
    source: string;
    business_name: string;
    last_updated: string;
  };
  className?: string;
}

export interface GoogleReviewsBadgeProps {
  rating: number;
  totalReviews: number;
  businessName?: string;
  className?: string;
}

// Form Components
export interface ErrorMessageProps {
  message: string;
  className?: string;
}

// Navigation Components
export interface PaginationLinkProps extends React.ComponentProps<'a'> {
  href: string;
  isActive?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
}

// Chart Components
export type ChartConfig = {
  type: 'line' | 'bar' | 'pie';
  data: any;
  options?: any;
  theme?: {
    [key in 'light' | 'dark' | 'system']: string;
  };
  [key: string]: any;
};

export type ChartContextProps = {
  config: ChartConfig;
  className?: string;
};

// Carousel Components
export type CarouselProps = {
  opts?: any;
  plugins?: any;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: any) => void;
};

export type CarouselContextProps = {
  carouselRef: any;
  api: any;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
};

// Toast Components
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
export type ToasterProps = React.ComponentProps<typeof Sonner>;

// Sheet Components
export const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

export interface SheetContentProps extends React.ComponentPropsWithoutRef<'div'> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

// Transition Components
export interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}

// Command Components
export interface CommandDialogProps extends DialogProps {}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

// Cart Types
export interface CartItem {
  id: number;
  user_id: number;
  wedding_id: number;
  vendor_id: number;
  category: string;
  price: number;
  booking_date: string;
  status: string;
  visit_date?: string;
  notes?: string;
  created_at: string;
  vendor?: {
    id: number;
    name: string;
    city: string;
    rating: number;
    images: string[];
    price_min?: number;
    price_max?: number;
  };
}

export interface CartSummary {
  total_items: number;
  total_amount: number;
  status_breakdown: Record<string, number>;
}

// Vendor Types
export interface Vendor {
  id: number;
  name: string;
  category: string;
  city: SupportedCity;
  description?: string;
  rating: number;
  review_count: number;
  price_min: number;
  price_max: number;
  images: string[];
  services?: string[];
  portfolio?: string[];
  is_featured: boolean;
  is_active: boolean;
  contact_phone: string;
  contact_email: string;
  contact_website?: string;
}

// Auth Types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export interface NavigationContextType {
  isLoading: boolean;
  navigate: (path: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

export interface WishlistItem {
  id: number;
  user_id: number;
  wedding_id: number;
  vendor_id: number;
  category: string;
  price: number;
  booking_date: string;
  status: string;
  created_at: string;
  vendor?: Vendor;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export interface CategoriesResponse {
  categories: string[];
}

export interface CitiesResponse {
  cities: SupportedCity[];
}

export interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  role: 'participant' | 'organizer';
}

export interface WeddingProject {
  id: number;
  user_id: number;
  name: string;
  city: SupportedCity;
  date: string;
  is_date_fixed: boolean;
  duration: number;
  events: string[];
  categories: string[];
  estimated_guests?: number,
  actual_guests?: number,
  budget: number;
  spent: number;
  status: 'planning' | 'partially_booked' | 'booked' | 'completed';
  family_details: FamilyMember[];

  created_at?: string;
  updated_at?: string;
}

export interface PersonalInfo {
  name: string;
  phoneNumber: string;
  email: string;
  city: SupportedCity;
}

// Package Types
export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  duration: string;
  image_url?: string;
  is_popular?: boolean;
  includes?: string[];
  vendors?: Array<{
    category: string;
    vendor_name: string;
    vendor_id: number;
  }>;
  customPrice?: number;
}

export interface CityContextType {
  selectedCity: SupportedCity | 'All';
  setSelectedCity: (city: SupportedCity | 'All') => void;
  clearCity: () => void;
} 