import { toast } from 'sonner';
import {
  ApiError,
  WeddingData,
  WeddingResponse,
  UserData,
  UserResponse,
  TokenResponse,
  VendorData,
  VendorResponse,
  GuestData,
  GuestResponse,
  CartItemData,
  CartItemResponse,
  ReviewResponse,
  ReviewsResponse,
  ReviewStats,
  BusinessRating
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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

  private getAuthHeaders(token?: string): Record<string, string> {
    const authToken = token || this.token;
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async createUserProfile(token: string, data: UserData): Promise<UserResponse> {
    return this.request('/auth/firebase-signup', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(token: string): Promise<UserResponse> {
    return this.request('/users/me', {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateUserProfile(token: string, data: Partial<UserData>): Promise<UserResponse> {
    return this.request('/users/me', {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  // Weddings
  async createWedding(token: string, data: WeddingData): Promise<WeddingResponse> {
    return this.request('/weddings', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getWeddings(token: string): Promise<WeddingResponse[]> {
    return this.request('/weddings', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getWedding(token: string, id: number): Promise<WeddingResponse> {
    return this.request(`/weddings/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateWedding(token: string, id: number, data: Partial<WeddingData>): Promise<WeddingResponse> {
    return this.request(`/weddings/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async deleteWedding(token: string, id: number): Promise<void> {
    return this.request(`/weddings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Vendors
  async getVendors(params?: {
    category?: string;
    location?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<VendorResponse[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/vendors?${searchParams.toString()}`);
  }

  async getVendor(id: number): Promise<VendorResponse> {
    return this.request(`/vendors/${id}`);
  }

  // Guests
  async addGuest(token: string, data: GuestData): Promise<GuestResponse> {
    return this.request('/guests', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getGuests(token: string, weddingId: number): Promise<GuestResponse[]> {
    return this.request(`/guests?wedding_id=${weddingId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateGuest(token: string, guestId: number, data: Partial<GuestData>): Promise<GuestResponse> {
    return this.request(`/guests/${guestId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async deleteGuest(token: string, guestId: number): Promise<void> {
    return this.request(`/guests/${guestId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Cart
  async addToCart(token: string, data: CartItemData): Promise<CartItemResponse> {
    return this.request('/cart', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getCartItems(token: string): Promise<CartItemResponse[]> {
    return this.request('/cart', {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateCartItem(token: string, itemId: number, data: Partial<CartItemData>): Promise<CartItemResponse> {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(token: string, itemId: number): Promise<void> {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
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
}

export const apiClient = new ApiClient();

// Helper function for handling API errors
export const handleApiError = (error: any, fallbackMessage: string = 'Something went wrong') => {
  if (error instanceof Error) {
    toast.error(error.message || fallbackMessage);
  } else {
    toast.error(fallbackMessage);
  }
  console.error('API Error:', error);
};

// Helper function for handling loading states
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