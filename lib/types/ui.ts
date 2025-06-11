// UI Component Types
import { type DialogProps } from '@radix-ui/react-dialog';
import { Toast, ToastAction } from '@/components/ui/toast';
import { Toaster as Sonner } from 'sonner';
import { badgeVariants } from '@/components/ui/badge';
import { VariantProps } from 'class-variance-authority';

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
export interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  image?: string;
  wedding_date: string;
  created_at: string;
  source: string;
  relative_time?: string;
}

export interface ReviewCardProps {
  review: Review;
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
export interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
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

export interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export interface NavigationContextType {
  currentPath: string;
  navigate: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface Vendor {
  id: number;
  name: string;
  category: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  rating: number;
  review_count: number;
  location: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  services?: string[];
  portfolio?: string[];
  contact_phone?: string;
  contact_email?: string;
  contact_website?: string;
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
}

export interface CategoriesResponse {
  categories: string[];
}

export interface CitiesResponse {
  cities: string[];
}

export interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  role: 'decision_maker' | 'participant' | 'observer';
}

export interface WeddingProject {
  id: number;
  name: string;
  date: string;
  location: string;
  estimated_guests: number;
  budget: number;
  spent: number;
  status: 'planning' | 'partially_booked' | 'booked' | 'completed';
  events: string[];
  family_details: FamilyMember[];
}

export interface PersonalInfo {
  name: string;
  phoneNumber: string;
  email: string;
  location: string;
} 