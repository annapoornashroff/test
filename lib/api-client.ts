// Enhanced API client with comprehensive error handling and real-time data fetching
import { toast } from 'sonner';
import {  
  ReviewsResponse, 
  ReviewResponse, 
  BusinessRating, 
  ReviewStats,
  ProfileStatusResponse,
  UserProfile
} from '@/lib/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface Relationship {
  id: number;
  user_id: number;
  related_user_id: number;
  relationship_type: string;
  privacy_level: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_at: string;
  responded_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getAuthHeaders(token?: string) {
    const authToken = token || this.token;
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          details: data,
        };
        
        // Handle specific error cases
        if (response.status === 401) {
          // Token will be cleared and user signed out by AuthContext
        } else if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.message);
        }
        
        throw error;
      }
      
      // Handle the new response structure
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        if (!data.success) {
          throw new Error(data.message || 'Request failed');
        }
        return data.data;
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        console.error(error);
        // Network error
        toast.error('Network error. Please check your connection.');
        throw new Error('Network error');
      }
      throw error;
    }
  }

  // Authentication - MERGED FROM api.ts
  async createUserProfile(data: UserProfile) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Users
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateUser(userData: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // MERGED: Alternative method name from api.ts for consistency
  async updateUserProfile(data: any) {
    return this.updateUser(data);
  }

  async deleteUser() {
    return this.request('/users/me', {
      method: 'DELETE',
    });
  }

  // Weddings - Updated to support token parameter
  async createWedding(weddingData: any) {
    return this.request('/weddings/', {
      method: 'POST',
      body: JSON.stringify(weddingData),
    });
  }

  async getWeddings() {
    return this.request('/weddings/');
  }

  async getWedding(id: number) {
    return this.request(`/weddings/${id}`);
  }

  async updateWedding(id: number, weddingData: any) {
    return this.request(`/weddings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(weddingData),
    });
  }

  async deleteWedding(id: number) {
    return this.request(`/weddings/${id}`, {
      method: 'DELETE',
    });
  }

  // Guests - Updated to support token parameter
  async addGuest(guestData: any) {
    return this.request('/guests/', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  }

  async getGuests(weddingId: number) {
    return this.request(`/guests/?wedding_id=${weddingId}`);
  }

  async updateGuest(guestId: number, guestData: any) {
    return this.request(`/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(guestData),
    });
  }

  async deleteGuest(guestId: number) {
    return this.request(`/guests/${guestId}`, {
      method: 'DELETE',
    });
  }

  async sendInvitation(guestId: number) {
    return this.request(`/guests/${guestId}/send-invitation`, {
      method: 'POST',
    });
  }

  async getGuestStatistics(weddingId: number) {
    return this.request(`/guests/statistics?wedding_id=${weddingId}`);
  }

  // Vendors
  async getVendors(params?: {
    category?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/vendors/?${searchParams.toString()}`);
  }

  async getVendor(id: number) {
    return this.request(`/vendors/${id}`);
  }

  async getVendorCategories() {
    return this.request('/vendors/categories');
  }

  async getVendorCities() {
    return this.request('/vendors/cities');
  }

  async getFeaturedVendors(limit: number = 10) {
    return this.request(`/vendors/featured?limit=${limit}`);
  }

  // Packages
  async getPackages() {
    return this.request('/packages/');
  }

  async getPackage(id: number) {
    return this.request(`/packages/${id}`);
  }

  async getPopularPackages() {
    return this.request('/packages/popular');
  }

  // Cart
  async getCartItems() {
    return this.request('/cart/');
  }

  async addToCart(cartItem: any) {
    return this.request('/cart/', {
      method: 'POST',
      body: JSON.stringify(cartItem),
    });
  }

  async updateCartItem(itemId: number, itemData: any) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async removeFromCart(itemId: number) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async getCartSummary() {
    return this.request('/cart/summary');
  }

  // Reviews
  async getReviews(params: { page?: number; limit?: number } = {}): Promise<ReviewsResponse> {
    const { page = 1, limit = 10 } = params;
    return this.request<ReviewsResponse>(`/reviews?page=${page}&limit=${limit}`);
  }

  async getFeaturedReviews(): Promise<ReviewResponse[]> {
    return this.request<ReviewResponse[]>('/reviews/featured');
  }

  async getBusinessRating(): Promise<BusinessRating> {
    return this.request<BusinessRating>('/reviews/business-rating');
  }

  async getReviewStats(): Promise<ReviewStats> {
    return this.request<ReviewStats>('/reviews/stats');
  }

  // Relationships
  async getRelationships(): Promise<Relationship[]> {
    const response = await this.request<{ data: Relationship[] }>('/relationships');
    return response.data;
  }

  async getPendingRelationships(): Promise<Relationship[]> {
    const response = await this.request<{ data: Relationship[] }>('/relationships/pending');
    return response.data;
  }

  async createRelationship(data: {
    related_user_id: number;
    relationship_type: string;
    relationship_name: string;
    is_primary?: boolean;
    privacy_level?: string;
  }): Promise<Relationship> {
    const response = await this.request<{ data: Relationship }>('/relationships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateRelationship(
    id: number,
    data: {
      relationship_type?: string;
      relationship_name?: string;
      privacy_level?: string;
    }
  ): Promise<Relationship> {
    const response = await this.request<{ data: Relationship }>(`/relationships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteRelationship(id: number): Promise<void> {
    await this.request(`/relationships/${id}`, {
      method: 'DELETE',
    });
  }

  async respondToRelationship(id: number, accept: boolean): Promise<void> {
    await this.request(`/relationships/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    });
  }

  // User Management
  async getUserByPhone(phoneNumber: string): Promise<UserProfile | null> {
    const response = await this.request<{ data: UserProfile }>(`/users/phone/${phoneNumber}`);
    return response.data;
  }

  async sendInvite(inviteData: {
    phone_number: string;
    name: string;
    relationship: string;
    invited_by: string;
  }) {
    return this.request('/users/invite', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  }
  
  async getProfileStatus(): Promise<ProfileStatusResponse> {
    return this.request('/auth/profile-status', {
      method: 'GET'
    });
  }
}

export const apiClient = new ApiClient();

// Error handling utilities
export const handleApiError = (error: any, fallbackMessage: string = 'Something went wrong') => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    toast.error(error.message);
  } else if (typeof error === 'string') {
    toast.error(error);
  } else {
    toast.error(fallbackMessage);
  }
};

// Loading state management
export const withLoading = async <T>(
  asyncFn: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T | null> => {
  try {
    setLoading(true);
    return await asyncFn();
  } catch (error) {
    handleApiError(error);
    return null;
  } finally {
    setLoading(false);
  }
};