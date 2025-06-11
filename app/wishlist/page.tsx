'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { 
  Heart, Star, MapPin, ShoppingCart, Trash2, 
  Calendar, Filter, Grid, List, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { apiClient, handleApiError } from '@/lib/api-client';
import { toast } from 'sonner';
import Image from 'next/image';
import { type Vendor, type WishlistItem } from '@/lib/types/ui';

const categories = ['All', 'Photography', 'Catering', 'Decoration', 'Music & DJ', 'Makeup', 'Venues'];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { user } = useAuth();
  useProtectedRoute();

  const fetchWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user) throw new Error('No user found');
      const token = await user.getIdToken();
      apiClient.setToken(token);
      const cartItems = await apiClient.getCartItems() as WishlistItem[];
      
      // Filter for wishlisted items only
      const wishlistItems = cartItems.filter((item) => item.status === 'wishlisted');
      setItems(wishlistItems);
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      setError(error.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    }
  }, [user, fetchWishlistItems]);

  const removeFromWishlist = async (id: number) => {
    try {
      if (!user) throw new Error('No user found');
      const token = await user.getIdToken();
      apiClient.setToken(token);
      await apiClient.removeFromCart(id);
      toast.success('Item removed from wishlist');
      
      // Refresh wishlist
      await fetchWishlistItems();
    } catch (error: any) {
      handleApiError(error, 'Failed to remove from wishlist');
    }
  };

  const moveToCart = async (id: number) => {
    try {
      if (!user) throw new Error('No user found');
      const token = await user.getIdToken();
      apiClient.setToken(token);
      await apiClient.updateCartItem(id, { status: 'selected' });
      toast.success('Item moved to cart');
      
      // Refresh wishlist
      await fetchWishlistItems();
    } catch (error: any) {
      handleApiError(error, 'Failed to move to cart');
    }
  };

  const filteredItems = items.filter((item: WishlistItem) => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const groupedByCategory = categories.reduce((acc, category) => {
    if (category === 'All') return acc;
    acc[category] = filteredItems.filter((item: WishlistItem) => item.category === category);
    return acc;
  }, {} as Record<string, WishlistItem[]>);

  const formatCurrency = (min?: number, max?: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}`;
    } else {
      return 'Price on request';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gold">Forever & Co.</h1>
                <p className="text-xs text-gold-600 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/vendors">
                <Button variant="outline" size="sm" className="rounded-full">
                  Browse Vendors
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="gold" size="sm" className="rounded-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              My Wishlist
            </h2>
            <p className="text-gray-600">
              {items.length} vendors saved for your special day
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-white rounded-lg border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* Wishlist Content */}
        {items.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding vendors you love to keep track of them</p>
              <Link href="/vendors">
                <Button className="bg-primary hover:bg-primary-600">
                  Browse Vendors
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : selectedCategory === 'All' ? (
          // Grouped by Category View
          <div className="space-y-8">
            {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
              categoryItems.length > 0 && (
                <div key={category}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    {category}
                    <span className="ml-2 text-sm text-gray-500">({categoryItems.length})</span>
                  </h3>
                  
                  <div className={viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {categoryItems.map((item: WishlistItem) => (
                      <WishlistCard 
                        key={item.id} 
                        item={item} 
                        viewMode={viewMode}
                        onRemove={removeFromWishlist}
                        onMoveToCart={moveToCart}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          // Filtered View
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredItems.map((item: WishlistItem) => (
              <WishlistCard 
                key={item.id} 
                item={item} 
                viewMode={viewMode}
                onRemove={removeFromWishlist}
                onMoveToCart={moveToCart}
              />
            ))}
          </div>
        )}

        {/* Bulk Actions */}
        {items.length > 0 && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  if (!user) throw new Error('No user found');
                  const token = await user.getIdToken();
                  apiClient.setToken(token);
                  // Move all items to cart
                  await Promise.all(
                    items.map((item) => 
                      apiClient.updateCartItem(item.id, { status: 'selected' })
                    )
                  );
                  toast.success('All items moved to cart');
                  await fetchWishlistItems();
                } catch (error) {
                  handleApiError(error, 'Failed to move items to cart');
                }
              }}
            >
              Move All to Cart
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={async () => {
                try {
                  if (!user) throw new Error('No user found');
                  const token = await user.getIdToken();
                  apiClient.setToken(token);
                  // Remove all items
                  await Promise.all(
                    items.map((item) => 
                      apiClient.removeFromCart(item.id)
                    )
                  );
                  toast.success('Wishlist cleared');
                  await fetchWishlistItems();
                } catch (error) {
                  handleApiError(error, 'Failed to clear wishlist');
                }
              }}
            >
              Clear Wishlist
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function WishlistCard({ 
  item, 
  viewMode, 
  onRemove, 
  onMoveToCart 
}: { 
  item: WishlistItem; 
  viewMode: 'grid' | 'list';
  onRemove: (id: number) => void;
  onMoveToCart: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  
  const handleAction = async (action: 'remove' | 'moveToCart') => {
    setLoading(true);
    try {
      if (action === 'remove') {
        await onRemove(item.id);
      } else {
        await onMoveToCart(item.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const vendor = item.vendor || {
    id: 0,
    name: 'Vendor Name',
    location: 'Location',
    rating: 4.5,
    images: ['https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'],
    price_min: undefined,
    price_max: undefined,
    review_count: 0
  };

  const formatPrice = () => {
    if (vendor.price_min && vendor.price_max) {
      return `₹${vendor.price_min.toLocaleString('en-IN')} - ₹${vendor.price_max.toLocaleString('en-IN')}`;
    } else if (vendor.price_min) {
      return `₹${vendor.price_min.toLocaleString('en-IN')}`;
    }
    return `₹${item.price.toLocaleString('en-IN')}`;
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex">
            <div className="relative w-32 h-32">
              <Image
                src={vendor.images?.[0] || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
                alt={vendor.name || 'Vendor'}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{vendor.name || 'Vendor Name'}</h3>
                  <p className="text-sm text-gold font-medium">{item.category}</p>
                </div>
                <button
                  onClick={() => handleAction('remove')}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 fill-current" />
                  )}
                </button>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {vendor.location || 'Location'}
                <span className="mx-2">•</span>
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {vendor.rating || '4.5'} ({vendor.review_count || '0'} reviews)
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900">{formatPrice()}</p>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Visit
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary-600"
                    onClick={() => handleAction('moveToCart')}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <Image
          src={vendor.images?.[0] || 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg'}
          alt={vendor.name || 'Vendor'}
          width={400}
          height={192}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={() => handleAction('remove')}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Heart className="w-4 h-4 text-red-500 fill-current" />
          )}
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{vendor.name || 'Vendor Name'}</h3>
            <p className="text-sm text-gold font-medium">{item.category}</p>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{vendor.rating || '4.5'}</span>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {vendor.location || 'Location'}
          <span className="mx-2">•</span>
          {vendor.review_count || '0'} reviews
        </div>

        <p className="text-sm text-gray-900 font-medium mb-4">{formatPrice()}</p>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Book Visit
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-primary hover:bg-primary-600"
            onClick={() => handleAction('moveToCart')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            Add to Cart
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Added {new Date(item.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}