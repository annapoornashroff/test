// API Types
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Wedding Types
export interface WeddingData {
  name: string;
  location: string;
  date: string;
  is_date_fixed: boolean;
  duration: number;
  events: string[];
  categories: string[];
  estimated_guests: number;
  budget: number;
}

export interface WeddingResponse extends WeddingData {
  id: number;
  user_id: number;
  actual_guests?: number;
  spent: number;
  status: 'planning' | 'partially_booked' | 'booked' | 'completed';
  family_details?: FamilyMember[];
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  name: string;
  relationship: string;
  role: string;
  contact?: string;
}

// User Types
export interface UserData {
  phone_number: string;
  name?: string;
  email?: string;
  location?: string;
}

export interface UserResponse extends UserData {
  id: number;
  firebase_uid?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
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
  location: string;
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
  name: string;
  location: string;
  rating: number;
  comment: string;
  image?: string;
  wedding_date: string;
  source: string;
  is_wedding_related?: boolean;
}

export interface ReviewResponse extends ReviewData {
  id: number;
  created_at: string;
  relative_time?: string;
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