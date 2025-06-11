// Enhanced API client with comprehensive error handling and real-time data fetching
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.detail || `HTTP error! status: ${response.status}`,
          status: response.status,
          details: errorData,
        };
        
        // Handle specific error cases
        if (response.status === 401) {
          this.clearToken();
          toast.error('Session expired. Please login again.');
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } else if (response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.message);
        }
        
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError') {
        // Network error
        toast.error('Network error. Please check your connection.');
        throw new Error('Network error');
      }
      throw error;
    }
  }

  // Authentication
  async login(phoneNumber: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async verifyOTP(phoneNumber: string, otp: string) {
    const response = await this.request<{ access_token: string; token_type: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, otp }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async signup(userData: any) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
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

  async deleteUser() {
    return this.request('/users/me', {
      method: 'DELETE',
    });
  }

  // Weddings
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

  // Vendors
  async getVendors(params?: {
    category?: string;
    location?: string;
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

  async getVendorLocations() {
    return this.request('/vendors/locations');
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
  async addToCart(cartItem: any) {
    return this.request('/cart/', {
      method: 'POST',
      body: JSON.stringify(cartItem),
    });
  }

  async getCartItems() {
    return this.request('/cart/');
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

  // Guests
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

  // Reviews
  async getReviews(limit: number = 6) {
    return this.request(`/reviews/?limit=${limit}`);
  }

  async getFeaturedReviews() {
    return this.request('/reviews/featured');
  }

  async getBusinessRating() {
    return this.request('/reviews/business-rating');
  }

  async getReviewStats() {
    return this.request('/reviews/stats');
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