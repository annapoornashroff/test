import { SUPPORTED_CITIES, CREATOR_ROLES, WEDDING_STATUS } from '@/lib/constants';

// API Types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface WeddingData {
  id?: number;
  user_id?: number;
  creator_role: (typeof CREATOR_ROLES)[number];
  title?: string;
  cities: (typeof SUPPORTED_CITIES)[number][];
  date: string;
  is_date_fixed: boolean;
  duration: number;
  events: string[];
  categories: string[];
  estimated_guests: number;
  actual_guests?: number;
  budget: number;
  spent?: number;
  timezone?: string; // IANA timezone name, e.g., 'Asia/Kolkata'
  status: (typeof WEDDING_STATUS)[number];
  family_details?: FamilyMember[];

  created_at?: string;
  updated_at?: string;
}

// Relationship Types
export interface UserRelationship {
  id: number;
  user_id: number;
  related_user_id: number;
  relationship_type: 'spouse' | 'parent' | 'child' | 'sibling' | 'other';
  relationship_name: string;  // e.g., "Mother", "Father", "Sister"
  is_primary: boolean;  // Whether this is the primary relationship between these users
  privacy_level: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  role: string;
  contact?: string;
  user_id?: number;  // Optional reference to a user account
  relationship_id?: number;  // Optional reference to a UserRelationship
}

// User Types
export interface UserProfile {
  id?: number;
  phone_number?: string;
  name?: string;
  email?: string;
  city: (typeof SUPPORTED_CITIES)[number];
  wedding?: WeddingData[];
  createdAt?: string;
}

// Auth Types
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Vendor Types
export interface VendorData {
  name: string;
  category: string;
  city: (typeof SUPPORTED_CITIES)[number];
  description: string;
  price_range: {
    min: number;
    max: number;
  };
  rating: number;
  reviews_count: number;
  images: string[];
}

export interface VendorResponse extends VendorData {
  id: number;
  created_at: string;
  updated_at: string;
}

// Guest Types
export interface GuestData {
  name: string;
  phone_number: string;
  email?: string;
  relationship?: string;
  category?: string;
}

export interface GuestResponse extends GuestData {
  id: number;
  wedding_id: number;
  confirmation_status: 'pending' | 'confirmed' | 'declined';
  invitation_sent: boolean;
  invitation_sent_at?: string;
  response_at?: string;
  created_at: string;
}

// Cart Types
export interface CartItemData {
  vendor_id: number;
  wedding_id: number;
  category: string;
  price: number;
  booking_date: string;
  status: 'wishlisted' | 'visited' | 'selected' | 'booked';
  visit_date?: string;
  notes?: string;
}

export interface CartItemResponse extends CartItemData {
  id: number;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface ReviewData {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  text: string;
  relative_time_description: string;
  time: number;
  wedding_date: string;
  city: (typeof SUPPORTED_CITIES)[number];
}

export interface ReviewResponse extends ReviewData {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReviewsResponse {
  reviews: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface BusinessRating {
  rating: number;
  total_reviews: number;
  business_name: string;
  source: string;
  place_id?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  recent_reviews_count: number;
  wedding_related_count: number;
  rating_distribution: Record<number, number>;
  source: string;
  business_name: string;
  last_updated: string;
}

export interface ProfileStatusResponse {
  exists: boolean;
  profile_complete: boolean;
  user?: UserProfile;
}
