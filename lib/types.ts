// Type definitions for the application

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  weddingDate?: Date;
  isDateFixed?: boolean;
  events?: string[];
  city?: string;
  createdAt: Date;
}

export interface Wedding {
  id: string;
  userId: string;
  city: string;
  date: Date;
  isDateFixed: boolean;
  duration: number;
  events: string[];
  categories: string[];
  estimatedGuests: number;
  actualGuests: Guest[];
  budget: number;
  status: 'planning' | 'partially booked' | 'booked' | 'completed';
  familyDetails: FamilyMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  city: string;
  description: string;
  images: string[];
  price: {
    min: number;
    max: number;
  };
  rating: number;
  reviews: number;
  availability: Date[];
  services: string[];
  portfolio: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  createdAt: Date;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  duration: string;
  includes: string[];
  vendors: {
    category: string;
    vendorId: string;
    vendorName: string;
  }[];
  popular?: boolean;
  customizable: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  vendorId: string;
  weddingId: string;
  category: string;
  price: number;
  bookingDate: Date;
  status: 'wishlisted' | 'visited' | 'selected' | 'booked';
  visitDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  confirmationStatus: 'pending' | 'confirmed' | 'declined';
  invitationSent: boolean;
  invitationSentAt?: Date;
  responseAt?: Date;
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  role: 'decision_maker' | 'participant' | 'observer';
}

export interface Testimonial {
  id: string;
  name: string;
  city: string;
  rating: number;
  comment: string;
  image?: string;
  weddingDate: Date;
  createdAt: Date;
}

export interface TrendingTheme {
  id: string;
  name: string;
  description: string;
  image: string;
  popularity: number;
  tags: string[];
  createdAt: Date;
}