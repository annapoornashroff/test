// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Authentication
  async createUserProfile(token: string, data: any) {
    return this.request('/auth/firebase-signup', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(token: string) {
    return this.request('/users/me', {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateUserProfile(token: string, data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
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
    if (params?.category) searchParams.append('category', params.category);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.min_price) searchParams.append('min_price', params.min_price.toString());
    if (params?.max_price) searchParams.append('max_price', params.max_price.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.request(`/vendors?${searchParams.toString()}`);
  }

  async getVendor(id: string) {
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
    return this.request('/packages');
  }

  async getPackage(id: string) {
    return this.request(`/packages/${id}`);
  }

  async getPopularPackages() {
    return this.request('/packages/popular');
  }

  // Weddings
  async createWedding(token: string, data: any) {
    return this.request('/weddings', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getWeddings(token: string) {
    return this.request('/weddings', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getWedding(token: string, id: string) {
    return this.request(`/weddings/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateWedding(token: string, id: string, data: any) {
    return this.request(`/weddings/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async deleteWedding(token: string, id: string) {
    return this.request(`/weddings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Cart
  async addToCart(token: string, data: any) {
    return this.request('/cart', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getCartItems(token: string) {
    return this.request('/cart', {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateCartItem(token: string, itemId: string, data: any) {
    return this.request(`/cart/${itemId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(token: string, itemId: string) {
    return this.request(`/cart/${itemId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async getCartSummary(token: string) {
    return this.request('/cart/summary', {
      headers: this.getAuthHeaders(token),
    });
  }

  // Guests
  async addGuest(token: string, data: any) {
    return this.request('/guests', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async getGuests(token: string, weddingId: string) {
    return this.request(`/guests?wedding_id=${weddingId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async updateGuest(token: string, guestId: string, data: any) {
    return this.request(`/guests/${guestId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
  }

  async deleteGuest(token: string, guestId: string) {
    return this.request(`/guests/${guestId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  async sendInvitation(token: string, guestId: string) {
    return this.request(`/guests/${guestId}/send-invitation`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
  }

  async getGuestStatistics(token: string, weddingId: string) {
    return this.request(`/guests/statistics?wedding_id=${weddingId}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  // Reviews
  async getReviews(limit: number = 6) {
    return this.request(`/reviews?limit=${limit}`);
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