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

export default function WishlistClient() {
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

            {/* If a specific category is selected, render only items from that category */}
            {selectedCategory !== 'All' && filteredItems.length > 0 && (
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
          </div>
        ) : (
          // Flat list view for specific category or if no grouping needed
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
      </div>
    </div>
  );
}

interface WishlistCardProps {
  item: WishlistItem;
  viewMode: 'grid' | 'list';
  onRemove: (id: number) => void;
  onMoveToCart: (id: number) => void;
}

function WishlistCard({
  item,
  viewMode,
  onRemove,
  onMoveToCart
}: WishlistCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleAction = async (action: 'remove' | 'moveToCart') => {
    if (action === 'remove') {
      setIsRemoving(true);
      await onRemove(item.id);
      setIsRemoving(false);
    } else if (action === 'moveToCart') {
      setIsMoving(true);
      await onMoveToCart(item.id);
      setIsMoving(false);
    }
  };

  const formatPrice = () => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
    
    if (item.vendor?.price_min && item.vendor?.price_max) {
      return `${formatter.format(item.vendor.price_min)} - ${formatter.format(item.vendor.price_max)}`;
    } else if (item.vendor?.price_min) {
      return formatter.format(item.vendor.price_min);
    } else {
      return 'Price on request';
    }
  };

  return viewMode === 'grid' ? (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-video">
        <Image 
          src={item.vendor?.images?.[0] || '/placeholder-vendor.jpg'}
          alt={item.vendor?.name || 'Vendor Image'}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{item.vendor?.name || 'N/A'}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.vendor?.description || 'No description available.'}</p>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{item.vendor?.city || 'N/A'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
          <span>{item.vendor?.rating?.toFixed(1) || 'N/A'} ({item.vendor?.review_count || 0} reviews)</span>
        </div>
        <div className="text-md font-bold text-primary mb-4">{formatPrice()}</div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => handleAction('remove')}
            disabled={isRemoving || isMoving}
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Remove
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gold hover:bg-gold-600"
            onClick={() => handleAction('moveToCart')}
            disabled={isRemoving || isMoving}
          >
            {isMoving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            Move to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className="flex items-center p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-24 h-24 flex-shrink-0 mr-4">
        <Image 
          src={item.vendor?.images?.[0] || '/placeholder-vendor.jpg'}
          alt={item.vendor?.name || 'Vendor Image'}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.vendor?.name || 'N/A'}</h3>
        <div className="flex items-center text-sm text-gray-500 mb-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{item.vendor?.city || 'N/A'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" />
          <span>{item.vendor?.rating?.toFixed(1) || 'N/A'} ({item.vendor?.review_count || 0} reviews)</span>
        </div>
        <div className="text-md font-bold text-primary">{formatPrice()}</div>
      </div>
      <div className="flex flex-col space-y-2 ml-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleAction('remove')}
          disabled={isRemoving || isMoving}
        >
          {isRemoving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Remove
        </Button>
        <Button 
          size="sm" 
          className="bg-gold hover:bg-gold-600"
          onClick={() => handleAction('moveToCart')}
          disabled={isRemoving || isMoving}
        >
          {isMoving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          Move to Cart
        </Button>
      </div>
    </Card>
  );
} 